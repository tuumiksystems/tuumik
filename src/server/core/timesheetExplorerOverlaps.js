/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Times, Projects } from '/src/shared/collections/collections.js';
import buildTimesQuery from '/src/server/utils/buildTimesQuery.js';

dayjs.extend(utc);

const CONFLICT_DAYS_CAP = 50;

const inputSchema = z.object({
  projectPickers: z.array(z.object({}).passthrough()),
  searchUsers: z.array(z.string()),
  teamId: z.string().min(1).optional(),
  period: z.object({
    start: z.date(),
    end: z.date(),
  }).refine(d => d.end >= d.start, { message: 'period.end must not be before period.start' }),
  taskDesc: z.string().optional(),
  tagColor: z.object({}).passthrough(),
  tagText: z.string().optional(),
  plan: z.enum(['actual', 'planned', 'both']).optional(),
})
  .refine(d => !(d.teamId && d.searchUsers.length), { message: 'Provide searchUsers or teamId, not both' });

// Server-side interval-collision sweep: finds user-days where time entries
// overlap each other (double-billing risk). Detection runs entirely in the
// aggregation pipeline (a running max of endMinute per user-day, sorted by
// startMinute: an entry overlaps iff it starts before that max), so the sweep
// is exact at any scale and only the conflicting days' entries are returned.
export default async function timesheetExplorerOverlaps(user, searchTerms) {
  if (!user.permissions.composer) throw new Meteor.Error('403', 'No permission to access composer');
  const parsed = inputSchema.safeParse(searchTerms);
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const { query, meta } = await buildTimesQuery(searchTerms);
  meta.notes = 'Each conflict is one user-day whose entries overlap; the day\'s full entry list is returned so the colliding intervals can be shown. Entries on different days or by different users never conflict.';

  if (meta.explanation) return { conflicts: [], conflictDayCount: 0, moreConflicts: false, meta };

  const conflictDays = await Times.rawCollection()
    .aggregate([
      { $match: query },
      {
        $setWindowFields: {
          partitionBy: { owner: '$owner', date: '$date' },
          sortBy: { startMinute: 1, endMinute: 1 },
          output: { prevMaxEnd: { $max: '$endMinute', window: { documents: ['unbounded', -1] } } },
        },
      },
      // an entry conflicts when it starts before the latest end among the
      // day's earlier-starting entries ($lt is false for the first entry,
      // whose prevMaxEnd is null)
      { $match: { $expr: { $lt: ['$startMinute', '$prevMaxEnd'] } } },
      { $group: { _id: { owner: '$owner', date: '$date' }, overlappingEntryCount: { $sum: 1 } } },
      { $sort: { '_id.date': 1, '_id.owner': 1 } },
      { $limit: CONFLICT_DAYS_CAP + 1 },
    ])
    .toArray();

  const moreConflicts = conflictDays.length > CONFLICT_DAYS_CAP;
  const days = conflictDays.slice(0, CONFLICT_DAYS_CAP);

  // fetch the flagged days' full entry lists (small: conflicts are rare) and
  // join names for presentation
  const conflicts = [];
  if (days.length) {
    const dayOr = days.map(d => ({ owner: d._id.owner, date: d._id.date }));
    const entries = await Times.find(
      { $and: [query, { $or: dayOr }] },
      { fields: { owner: 1, date: 1, startMinute: 1, endMinute: 1, projectId: 1, taskDesc: 1, plan: 1 }, sort: { date: 1, startMinute: 1 } },
    ).fetchAsync();

    const userDocs = await Meteor.users.find({ _id: { $in: [...new Set(days.map(d => d._id.owner))] } }, { fields: { name: 1 } }).fetchAsync();
    const projectDocs = await Projects.find({ _id: { $in: [...new Set(entries.map(e => e.projectId).filter(Boolean))] } }, { fields: { name: 1 } }).fetchAsync();

    for (const d of days) {
      const dayEntries = entries.filter(e => e.owner === d._id.owner && e.date.getTime() === d._id.date.getTime());
      conflicts.push({
        userId: d._id.owner,
        userName: userDocs.find(u => u._id === d._id.owner)?.name ?? null,
        date: dayjs.utc(d._id.date).format('YYYY-MM-DD'),
        overlappingEntryCount: d.overlappingEntryCount,
        entries: dayEntries.map(e => ({
          timeId: e._id,
          startMinute: e.startMinute,
          endMinute: e.endMinute,
          projectName: projectDocs.find(p => p._id === e.projectId)?.name ?? null,
          taskDesc: e.taskDesc,
          ...(e.plan ? { plan: true } : {}),
        })),
      });
    }
  }

  return { conflicts, conflictDayCount: conflictDays.length - (moreConflicts ? 1 : 0), moreConflicts, meta };
}
