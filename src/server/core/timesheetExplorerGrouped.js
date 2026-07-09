/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Times, Clients, Projects, Tenant, TaskGroups } from '/src/shared/collections/collections.js';
import buildTimesQuery from '/src/server/utils/buildTimesQuery.js';

dayjs.extend(utc);

const BUCKET_FORMATS = { month: '%Y-%m', week: '%G-W%V', day: '%Y-%m-%d', dayOfWeek: '%u' };
const BUCKET_APPROX_DAYS = { month: 30, week: 7, day: 1 };
const DOW_LABELS = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun' };
const EMPTY_GROUPS_CAP = 1000;

const dimSchema = z.enum(['project', 'client', 'user', 'team', 'taskType', 'none']);
// normalized list of requested dimensions, for refines that must hold per dimension
const dimsOf = d => (Array.isArray(d.groupBy) ? d.groupBy : [d.groupBy]);

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
  overlapMinutes: z.object({
    from: z.number().int().min(0).max(1440),
    to: z.number().int().min(0).max(1440),
  }).refine(d => d.to > d.from, { message: 'overlapMinutes.to must be greater than overlapMinutes.from' }).optional(),
  minDurationMinutes: z.number().int().min(0).max(1440).optional(),
  maxDurationMinutes: z.number().int().min(0).max(1440).optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1).optional(),
  groupBy: z.union([dimSchema, z.array(dimSchema).min(1).max(4)]),
  bucketBy: z.enum(['month', 'week', 'day', 'dayOfWeek']).optional(),
  top: z.number().int().min(1).max(500).optional(),
  includeEmpty: z.boolean().optional(),
  durationStats: z.boolean().optional(),
  lagStats: z.boolean().optional(),
  comparePeriod: z.object({
    start: z.date(),
    end: z.date(),
  }).refine(d => d.end >= d.start, { message: 'comparePeriod.end must not be before comparePeriod.start' }).optional(),
  comparePlan: z.boolean().optional(),
})
  .refine(d => !(d.teamId && d.searchUsers.length), { message: 'Provide searchUsers or teamId, not both' })
  .refine(d => !(d.comparePlan && d.comparePeriod), { message: 'comparePlan cannot be combined with comparePeriod: it compares planned vs actual over the SAME period' })
  .refine(d => !(d.comparePlan && d.bucketBy), { message: 'comparePlan cannot be combined with bucketBy' })
  .refine(d => !(d.comparePlan && d.plan && d.plan !== 'actual'), { message: 'comparePlan compares actual entries against planned ones; leave the plan filter unset (or "actual")' })
  .refine(d => !(d.teamId && dimsOf(d).includes('team')), { message: 'teamId cannot be combined with groupBy "team": the filter restricts to one team\'s members, but the grouping then re-splits those members\' hours across every team each of them belongs to, double-counting multi-team users. For one team\'s totals use teamId with groupBy "none" (or another groupBy); to rank all teams, use groupBy "team" without teamId.' })
  .refine(d => !(d.includeEmpty && dimsOf(d).every(g => g === 'none')), { message: 'includeEmpty is not valid with groupBy "none"' })
  .refine(d => !(d.durationStats && d.bucketBy), { message: 'durationStats cannot be combined with bucketBy' })
  .refine(d => !(d.durationStats && dimsOf(d).includes('team')), { message: 'durationStats cannot be combined with groupBy "team" (per-user stats cannot be merged into teams)' })
  .refine(d => !(d.lagStats && d.bucketBy), { message: 'lagStats cannot be combined with bucketBy' })
  .refine(d => !(d.lagStats && dimsOf(d).includes('team')), { message: 'lagStats cannot be combined with groupBy "team" (per-user stats cannot be merged into teams)' })
  .refine(d => !(d.comparePeriod && d.bucketBy), { message: 'comparePeriod cannot be combined with bucketBy (for trends, widen the bucketed period instead)' });

const durExpr = { $subtract: ['$endMinute', '$startMinute'] };

// logging lag in whole calendar days: the entry's creation day (in the entry's
// own timezone) minus its work day. 0 = logged same-day; null when the entry
// predates the createdAt field (no backfill exists for old real-world entries).
// Both sides round-trip through a date string so they compare as plain
// calendar days regardless of timezone offsets.
const calendarDayOf = (dateExpr, tzExpr) => ({ $dateFromString: { dateString: { $dateToString: { format: '%Y-%m-%d', date: dateExpr, timezone: tzExpr } } } });
const lagExpr = {
  $cond: [
    { $ifNull: ['$createdAt', false] },
    { $dateDiff: { startDate: calendarDayOf('$date', 'UTC'), endDate: calendarDayOf('$createdAt', { $ifNull: ['$tz', 'UTC'] }), unit: 'day' } },
    null,
  ],
};

const dayStr = d => (d ? dayjs.utc(d).format('YYYY-MM-DD') : null);

export default async function timesheetExplorerGrouped(user, searchTerms) {
  if (!user.permissions.composer) throw new Meteor.Error('403', 'No permission to access composer');
  const parsed = inputSchema.safeParse(searchTerms);
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const { bucketBy, includeEmpty, durationStats, lagStats, comparePeriod, comparePlan } = searchTerms;
  const top = searchTerms.top || 50;
  // several dimensions can be requested at once (e.g. a month-end report needs
  // none + project + user); a single dimension keeps the legacy response shape
  const groupDims = [...new Set(Array.isArray(searchTerms.groupBy) ? searchTerms.groupBy : [searchTerms.groupBy])];
  const multi = groupDims.length > 1;

  const { query, meta } = await buildTimesQuery(searchTerms);
  meta.groupBy = searchTerms.groupBy;
  if (bucketBy) meta.bucketBy = bucketBy;
  meta.top = top;
  if (comparePeriod) {
    const cStartDay = dayjs.utc(comparePeriod.start).startOf('day');
    const cEndDay = dayjs.utc(comparePeriod.end).startOf('day');
    meta.comparePeriod = { start: cStartDay.toDate(), end: dayjs.utc(comparePeriod.end).endOf('day').toDate() };
    const cElapsedRaw = dayjs.utc().startOf('day').diff(cStartDay, 'day') + 1;
    const cDays = cEndDay.diff(cStartDay, 'day') + 1;
    meta.comparePeriodInfo = { days: cDays, elapsedDays: Math.max(0, Math.min(cDays, cElapsedRaw)) };
  } else if (comparePlan) {
    // compare = planned entries over the SAME period, so both sides share day counts
    meta.comparePlan = true;
    meta.comparePeriodInfo = { ...meta.periodInfo };
  }

  if (meta.explanation) {
    if (!multi) return { groups: [], moreGroups: false, meta };
    const byDimension = {};
    for (const dim of groupDims) byDimension[dim] = { groups: [], moreGroups: false };
    return { byDimension, meta };
  }

  const compareQuery = comparePeriod ? { ...query, date: { $gt: meta.comparePeriod.start, $lt: meta.comparePeriod.end } }
    : comparePlan ? { ...query, plan: true }
      : null;

  const appendNote = note => {
    if (!(meta.notes || '').includes(note)) meta.notes = `${meta.notes ? `${meta.notes} ` : ''}${note}`;
  };

  if (lagStats) appendNote('Lag stats cover only entries that carry createdAt; entries predating that field contribute nothing to the lag numbers.');

  const runDimension = async groupBy => {
    // teams live on users, not on Times docs: group per user in the pipeline and
    // merge the per-user rows into teams in JS afterwards
    const pipelineGroupBy = groupBy === 'team' ? 'user' : groupBy;
    const groupField = { project: '$projectId', client: '$clientId', user: '$owner', taskType: '$taskType', none: null }[pipelineGroupBy];
    // for 'team' every user row is needed for the merge, not just the top slice
    const pipelineLimit = groupBy === 'team' ? 10000 : top + 1;

    // bucket-mode row-volume guard: keep responses LLM-sized. The cheap estimate
    // (buckets x top) overshoots when top exceeds the real number of groups, so
    // before rejecting, count the actual dimensions and re-evaluate against those.
    if (bucketBy) {
      const dayCount = dayjs.utc(searchTerms.period.end).diff(dayjs.utc(searchTerms.period.start), 'day') + 1;
      const bucketEstimate = bucketBy === 'dayOfWeek' ? 7 : Math.ceil(dayCount / BUCKET_APPROX_DAYS[bucketBy]) + 1;
      if (bucketEstimate * top > 2000) {
        const dimCountRes = await Times.rawCollection().aggregate([{ $match: query }, { $group: { _id: groupField } }, { $count: 'n' }]).toArray();
        const dimCount = dimCountRes[0]?.n || 0;
        if (bucketEstimate * Math.min(top, dimCount) > 2000) throw new Meteor.Error('400', 'Too many bucket rows would be returned: use a coarser bucketBy, a shorter period, or a smaller top');
      }
    }

    const buildPipeline = (matchQuery, withMedian, limitN) => {
      const accums = {};
      if (durationStats) {
        accums.avgDurationMinutes = { $avg: durExpr };
        accums.maxDurationMinutes = { $max: durExpr };
        if (withMedian) accums.medianDurationMinutes = { $median: { input: durExpr, method: 'approximate' } };
      }
      if (lagStats) {
        accums.avgLagDays = { $avg: lagExpr };
        accums.maxLagDays = { $max: lagExpr };
        if (withMedian) accums.medianLagDays = { $median: { input: lagExpr, method: 'approximate' } };
        // share of lag-measurable entries logged the same day they were worked
        accums.sameDayShare = { $avg: { $cond: [{ $eq: [lagExpr, null] }, null, { $cond: [{ $lte: [lagExpr, 0] }, 1, 0] }] } };
      }
      if (!bucketBy) {
        return [
          { $match: matchQuery },
          {
            $group: {
              _id: groupField,
              minutesTotal: { $sum: durExpr },
              tasksTotal: { $sum: 1 },
              userIds: { $addToSet: '$owner' },
              firstEntryDate: { $min: '$date' },
              lastEntryDate: { $max: '$date' },
              ...accums,
            },
          },
          { $addFields: { userCount: { $size: '$userIds' } } },
          { $project: { userIds: 0 } },
          { $sort: { minutesTotal: -1, _id: 1 } },
          { $limit: limitN },
        ];
      }
      return [
        { $match: matchQuery },
        {
          $group: {
            _id: { dim: groupField, bucket: { $dateToString: { format: BUCKET_FORMATS[bucketBy], date: '$date' } } },
            minutesTotal: { $sum: durExpr },
            tasksTotal: { $sum: 1 },
            userIds: { $addToSet: '$owner' },
            dates: { $addToSet: '$date' },
            firstEntryDate: { $min: '$date' },
            lastEntryDate: { $max: '$date' },
          },
        },
        { $addFields: { userCount: { $size: '$userIds' }, dayCount: { $size: '$dates' } } },
        { $project: { userIds: 0, dates: 0 } },
        { $sort: { '_id.bucket': 1 } },
        {
          $group: {
            _id: '$_id.dim',
            minutesTotal: { $sum: '$minutesTotal' },
            tasksTotal: { $sum: '$tasksTotal' },
            firstEntryDate: { $min: '$firstEntryDate' },
            lastEntryDate: { $max: '$lastEntryDate' },
            buckets: { $push: { bucket: '$_id.bucket', minutesTotal: '$minutesTotal', tasksTotal: '$tasksTotal', userCount: '$userCount', dayCount: '$dayCount' } },
          },
        },
        { $sort: { minutesTotal: -1, _id: 1 } },
        { $limit: limitN },
      ];
    };

    const runPipeline = async (matchQuery, limitN) => {
      try {
        return await Times.rawCollection().aggregate(buildPipeline(matchQuery, true, limitN)).toArray();
      } catch (err) {
        // $median needs MongoDB 7+; retry without it on older servers
        if ((durationStats || lagStats) && /median/i.test(String(err?.message))) {
          const rowsNoMedian = await Times.rawCollection().aggregate(buildPipeline(matchQuery, false, limitN)).toArray();
          appendNote('Median stats unavailable: require MongoDB 7+.');
          for (const row of rowsNoMedian) {
            if (durationStats) row.medianDurationMinutes = null;
            if (lagStats) row.medianLagDays = null;
          }
          return rowsNoMedian;
        }
        throw err;
      }
    };

    // merge per-user rows into teams; multi-team users count toward each of their
    // teams (deliberate: each team's total includes all of its members' hours)
    const mergeTeamRows = (rowsIn, ownersById) => {
      const merged = new Map();
      const addTo = (key, row) => {
        let entry = merged.get(key);
        if (!entry) {
          entry = { minutesTotal: 0, tasksTotal: 0, userCount: 0, firstEntryDate: null, lastEntryDate: null, bucketMap: new Map() };
          merged.set(key, entry);
        }
        entry.minutesTotal += row.minutesTotal;
        entry.tasksTotal += row.tasksTotal;
        entry.userCount += 1;
        if (!entry.firstEntryDate || row.firstEntryDate < entry.firstEntryDate) entry.firstEntryDate = row.firstEntryDate;
        if (!entry.lastEntryDate || row.lastEntryDate > entry.lastEntryDate) entry.lastEntryDate = row.lastEntryDate;
        for (const b of row.buckets || []) {
          let bEntry = entry.bucketMap.get(b.bucket);
          if (!bEntry) {
            bEntry = { bucket: b.bucket, minutesTotal: 0, tasksTotal: 0, userCount: 0 };
            entry.bucketMap.set(b.bucket, bEntry);
          }
          bEntry.minutesTotal += b.minutesTotal;
          bEntry.tasksTotal += b.tasksTotal;
          bEntry.userCount += 1;
        }
      };
      for (const row of rowsIn) {
        const inTeams = ownersById.get(row._id)?.inTeams || [];
        if (inTeams.length) for (const tId of inTeams) addTo(tId, row);
        else addTo(null, row);
      }
      const out = [...merged.entries()].map(([key, entry]) => ({
        _id: key,
        minutesTotal: entry.minutesTotal,
        tasksTotal: entry.tasksTotal,
        userCount: entry.userCount,
        firstEntryDate: entry.firstEntryDate,
        lastEntryDate: entry.lastEntryDate,
        ...(bucketBy ? { buckets: [...entry.bucketMap.values()].sort((a, b) => a.bucket.localeCompare(b.bucket)) } : {}),
      }));
      out.sort((a, b) => b.minutesTotal - a.minutesTotal || String(a._id).localeCompare(String(b._id)));
      return out;
    };

    let rows = await runPipeline(query, pipelineLimit);
    let tenantTeamsList = [];
    let ownersById = new Map();
    if (groupBy === 'team') {
      const tenant = await Tenant.findOneAsync({}, { fields: { teams: 1 } });
      tenantTeamsList = tenant?.teams || [];
      const owners = await Meteor.users.find({}, { fields: { inTeams: 1 } }).fetchAsync();
      ownersById = new Map(owners.map(o => [o._id, o]));
      rows = mergeTeamRows(rows, ownersById).slice(0, top + 1);
      appendNote('Users in several teams count toward each of their teams, so team totals may sum to more than the firm total. Team membership is current membership.');
    }

    let moreGroups = rows.length > top;
    if (moreGroups) rows = rows.slice(0, top);

    // second run over the comparison scope (another date range, or the same
    // period's planned entries with comparePlan); joined onto the groups below
    let compareByDim = null;
    if (compareQuery) {
      let compareRows = await runPipeline(compareQuery, 10000);
      if (groupBy === 'team') compareRows = mergeTeamRows(compareRows, ownersById);
      compareByDim = new Map(compareRows.map(r => [String(r._id), r]));

      // union semantics: dims active only in the compare scope still appear, as
      // zero rows in the main results, so the comparison never loses one side
      // (e.g. "this week vs last week" asked on Monday morning with nothing
      // logged yet, or a user with plans who delivered nothing). Only possible
      // when the main dim set is fully known.
      if (!moreGroups) {
        const mainDims = new Set(rows.map(r => String(r._id)));
        const extras = [...compareByDim.values()]
          .filter(r => !mainDims.has(String(r._id)))
          .sort((a, b) => b.minutesTotal - a.minutesTotal)
          .map(r => ({ _id: r._id, minutesTotal: 0, tasksTotal: 0, userCount: 0, firstEntryDate: null, lastEntryDate: null }));
        const room = top - rows.length;
        if (extras.length > room) moreGroups = true;
        if (extras.length && room > 0) {
          rows = rows.concat(extras.slice(0, room));
          appendNote(comparePlan
            ? 'Groups with minutesTotal 0 have no actual entries in the period; they are included because they have planned entries.'
            : 'Groups with minutesTotal 0 had no activity in the main period; they are included because they have activity in comparePeriod.');
        }
      }
    }

    // joins for names
    const projectDocs = groupBy === 'project' ? await Projects.find({ _id: { $in: rows.map(r => r._id).filter(Boolean) } }, { fields: { name: 1, clientId: 1 } }).fetchAsync() : [];
    const clientJoinIds = groupBy === 'client' ? rows.map(r => r._id).filter(Boolean) : projectDocs.map(p => p.clientId);
    const clientDocs = clientJoinIds.length ? await Clients.find({ _id: { $in: [...new Set(clientJoinIds)] } }, { fields: { name: 1 } }).fetchAsync() : [];
    const userDocs = groupBy === 'user' ? await Meteor.users.find({ _id: { $in: rows.map(r => r._id) } }, { fields: { name: 1, createdAt: 1 } }).fetchAsync() : [];
    const tenantTeams = tenantTeamsList;
    // /joins for names

    const groups = rows.map(row => {
      const out = {
        minutesTotal: row.minutesTotal,
        hoursTotal: row.minutesTotal / 60,
        tasksTotal: row.tasksTotal,
        firstEntryDate: dayStr(row.firstEntryDate),
        lastEntryDate: dayStr(row.lastEntryDate),
      };
      if (groupBy !== 'user' && row.userCount !== undefined) out.userCount = row.userCount;
      if (bucketBy) {
        out.buckets = (row.buckets || []).map(b => ({
          ...b,
          // '%u' gives ISO weekday numbers; label them for readability (order stays Mon..Sun)
          ...(bucketBy === 'dayOfWeek' ? { bucket: DOW_LABELS[Number(b.bucket)] || b.bucket } : {}),
          hoursTotal: b.minutesTotal / 60,
        }));
      }
      if (compareByDim) {
        const c = compareByDim.get(String(row._id));
        const compareMinutes = c?.minutesTotal || 0;
        // rates are normalized by ELAPSED days so periods of unequal length (or a
        // partial current period) compare fairly; raw deltaPercent stays as-is
        const mainDays = meta.periodInfo.elapsedDays;
        const compareDays = meta.comparePeriodInfo.elapsedDays;
        const mainRate = mainDays ? row.minutesTotal / mainDays : null;
        const compareRate = compareDays ? compareMinutes / compareDays : null;
        out.hoursPerDay = mainRate === null ? null : Math.round((mainRate / 60) * 100) / 100;
        out.compare = {
          minutesTotal: compareMinutes,
          hoursTotal: compareMinutes / 60,
          tasksTotal: c?.tasksTotal || 0,
          hoursPerDay: compareRate === null ? null : Math.round((compareRate / 60) * 100) / 100,
          deltaMinutes: row.minutesTotal - compareMinutes,
          deltaHours: (row.minutesTotal - compareMinutes) / 60,
          // null when the compare period had no activity: "new", not +infinity%
          deltaPercent: compareMinutes ? Math.round(((row.minutesTotal - compareMinutes) / compareMinutes) * 1000) / 10 : null,
          // null when either period has no elapsed days or no compare activity
          deltaPercentPerDay: mainRate !== null && compareRate ? Math.round(((mainRate - compareRate) / compareRate) * 1000) / 10 : null,
        };
      }
      if (durationStats) {
        out.avgDurationMinutes = row.avgDurationMinutes == null ? null : Math.round(row.avgDurationMinutes * 10) / 10;
        out.medianDurationMinutes = row.medianDurationMinutes ?? null;
        out.maxDurationMinutes = row.maxDurationMinutes ?? null;
      }
      if (lagStats) {
        out.avgLagDays = row.avgLagDays == null ? null : Math.round(row.avgLagDays * 100) / 100;
        out.medianLagDays = row.medianLagDays ?? null;
        out.maxLagDays = row.maxLagDays ?? null;
        out.sameDayShare = row.sameDayShare == null ? null : Math.round(row.sameDayShare * 1000) / 1000;
      }
      if (groupBy === 'project') {
        const projectDoc = projectDocs.find(p => p._id === row._id);
        out.projectId = row._id;
        out.projectName = projectDoc?.name ?? null;
        out.clientName = clientDocs.find(c => c._id === projectDoc?.clientId)?.name ?? null;
        if (row._id === null) out.note = 'entries with no project set';
      } else if (groupBy === 'client') {
        out.clientId = row._id;
        out.clientName = clientDocs.find(c => c._id === row._id)?.name ?? null;
        if (row._id === null) out.note = 'entries with no client set';
      } else if (groupBy === 'user') {
        const userDoc = userDocs.find(u => u._id === row._id);
        out.userId = row._id;
        out.userName = userDoc?.name ?? null;
        // account creation day, so callers can prorate per-user baselines by tenure
        out.userCreatedAt = dayStr(userDoc?.createdAt);
      } else if (groupBy === 'taskType') {
        out.taskType = row._id ?? null;
        if (row._id == null || row._id === '') out.note = 'entries with no task type set';
      } else if (groupBy === 'team') {
        out.teamId = row._id;
        out.teamName = row._id === null ? 'No team' : tenantTeams.find(t => t.id === row._id)?.name ?? null;
      }
      return out;
    });

    const result = { groups, moreGroups };

    // dormancy support: entities of the dimension with zero matching entries
    // (not meaningful for 'none', which is skipped when part of a multi request)
    if (includeEmpty && groupBy !== 'none') {
      // a separate dim-only aggregation, so the diff is not distorted by the top cut
      const activeDims = groupBy === 'team'
        ? new Set(rows.length ? (await Times.rawCollection().aggregate([{ $match: query }, { $group: { _id: '$owner' } }]).toArray()).map(r => r._id) : [])
        : new Set((await Times.rawCollection().aggregate([{ $match: query }, { $group: { _id: groupField } }]).toArray()).map(r => r._id));

      let emptyGroups = [];
      if (groupBy === 'project') {
        const pickerClientIds = searchTerms.projectPickers.filter(x => !x.projectId && x.clientId).map(x => x.clientId);
        const projQuery = pickerClientIds.length ? { clientId: { $in: pickerClientIds } } : {};
        const allProjects = await Projects.find(projQuery, { fields: { name: 1, clientId: 1 }, sort: { name: 1 } }).fetchAsync();
        const emptyProjects = allProjects.filter(p => !activeDims.has(p._id));
        const emptyClientIds = [...new Set(emptyProjects.map(p => p.clientId))];
        const emptyClients = await Clients.find({ _id: { $in: emptyClientIds } }, { fields: { name: 1 } }).fetchAsync();
        emptyGroups = emptyProjects.map(p => ({ projectId: p._id, name: p.name, clientName: emptyClients.find(c => c._id === p.clientId)?.name ?? null }));
      } else if (groupBy === 'client') {
        const allClients = await Clients.find({}, { fields: { name: 1 }, sort: { name: 1 } }).fetchAsync();
        emptyGroups = allClients.filter(c => !activeDims.has(c._id)).map(c => ({ clientId: c._id, name: c.name }));
      } else if (groupBy === 'user') {
        // diff against the addressed set when one was given, otherwise all non-disabled users
        const userQuery = searchTerms.teamId ? { inTeams: searchTerms.teamId, disabled: { $ne: true } }
          : searchTerms.searchUsers.length ? { _id: { $in: searchTerms.searchUsers } }
            : { disabled: { $ne: true } };
        const allUsers = await Meteor.users.find(userQuery, { fields: { name: 1 }, sort: { name: 1 } }).fetchAsync();
        emptyGroups = allUsers.filter(u => !activeDims.has(u._id)).map(u => ({ userId: u._id, name: u.name }));
      } else if (groupBy === 'taskType') {
        const taskGroups = await TaskGroups.find({}, { fields: { types: 1 } }).fetchAsync();
        const allTypes = [...new Set(taskGroups.flatMap(g => (g.types || []).map(t => t.txt)))].sort();
        emptyGroups = allTypes.filter(t => !activeDims.has(t)).map(t => ({ taskType: t }));
      } else if (groupBy === 'team') {
        const tenant = await Tenant.findOneAsync({}, { fields: { teams: 1 } });
        const usersWithTeams = await Meteor.users.find({ _id: { $in: [...activeDims] } }, { fields: { inTeams: 1 } }).fetchAsync();
        const activeTeamIds = new Set(usersWithTeams.flatMap(u => u.inTeams || []));
        emptyGroups = (tenant?.teams || []).filter(t => !activeTeamIds.has(t.id)).map(t => ({ teamId: t.id, name: t.name }));
      }

      result.moreEmptyGroups = emptyGroups.length > EMPTY_GROUPS_CAP;
      result.emptyGroups = emptyGroups.slice(0, EMPTY_GROUPS_CAP);
    }

    return result;
  };

  if (!multi) {
    const result = await runDimension(groupDims[0]);
    return { ...result, meta };
  }

  const byDimension = {};
  for (const dim of groupDims) byDimension[dim] = await runDimension(dim);
  return { byDimension, meta };
}
