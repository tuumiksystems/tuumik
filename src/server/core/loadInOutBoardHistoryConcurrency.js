/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Statuses, Tenant } from '/src/shared/collections/collections.js';
import resolveUserAddressing from '/src/server/utils/resolveUserAddressing.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const MAX_DAYS = 1000;

const inputSchema = z.object({
  userIds: z.array(z.string()).min(1).optional(),
  teamId: z.string().min(1).optional(),
  allUsers: z.boolean().optional(),
  startLocal: z.date(),
  endLocal: z.date(),
  overlapMinutes: z.object({
    from: z.number().int().min(0).max(1440),
    to: z.number().int().min(0).max(1440),
  }).refine(d => d.to > d.from, { message: 'overlapMinutes.to must be greater than overlapMinutes.from' }).optional(),
})
  .refine(d => d.endLocal > d.startLocal, { message: 'endLocal must be after startLocal' })
  .refine(d => [d.userIds, d.teamId, d.allUsers].filter(Boolean).length === 1, { message: 'Provide exactly one of userIds, teamId or allUsers' });

// How many of the addressed users were in a work:true status at the same
// moment — an interval-overlap sweep, which is a different computation from
// the time-in-status totals: totals answer "how many hours was each person
// available", this answers "how many people were available simultaneously"
// (coverage/staffing questions).
export default async function loadInOutBoardHistoryConcurrency(user, args) {
  const { userIds, teamId, allUsers, startLocal, endLocal, overlapMinutes } = args;
  if (!user.permissions.inOutView) throw new Meteor.Error('403', 'No permission to view in/out board');

  // only wrap a bare string when userIds was actually provided
  const normalizedIds = userIds == null || Array.isArray(userIds) ? userIds : [userIds];

  const parsed = inputSchema.safeParse({ ...args, userIds: normalizedIds });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const tenant = await Tenant.findOneAsync();
  const { inOutOptions } = tenant;
  const refTz = tenant.defaultTimezone || 'UTC';

  const { users: resolvedUsers, userIds: resolvedUserIds, mode } = await resolveUserAddressing({ userIds: normalizedIds, teamId });

  const meta = {};
  meta.users = resolvedUsers.map(u => ({ userId: u._id, name: u.name }));
  meta.addressing = teamId ? { mode, teamId } : { mode };
  meta.period = { start: startLocal, end: endLocal };
  if (overlapMinutes) meta.overlapMinutes = overlapMinutes;
  meta.timezone = refTz;
  meta.notes = 'Concurrency counts users whose work: true status periods overlap the same instant, per local day in the tenant default timezone. The currently ongoing (unarchived) status period is not included; use inout_board_current for the live board.';

  if (!resolvedUserIds.length) {
    meta.explanation = 'No users matched the given addressing (empty team or unknown user ids)';
    return { days: [], overall: null, meta };
  }

  // one sweep window per local day, clamped to the queried period
  const dayWindows = [];
  let dayStart = dayjs(startLocal).tz(refTz).startOf('day');
  while (dayStart.valueOf() < endLocal.getTime()) {
    const dayEnd = dayStart.add(1, 'day');
    const winStart = Math.max(overlapMinutes ? dayStart.add(overlapMinutes.from, 'minute').valueOf() : dayStart.valueOf(), startLocal.getTime());
    const winEnd = Math.min(overlapMinutes ? dayStart.add(overlapMinutes.to, 'minute').valueOf() : dayEnd.valueOf(), endLocal.getTime());
    if (winEnd > winStart) dayWindows.push({ date: dayStart.format('YYYY-MM-DD'), winStart, winEnd, events: [] });
    if (dayWindows.length > MAX_DAYS) throw new Meteor.Error('400', `Period covers more than ${MAX_DAYS} days: shorten the period`);
    dayStart = dayEnd;
  }

  await Statuses.find(
    {
      $or: [
        { start: { $gt: startLocal, $lt: endLocal } },
        { end: { $gt: startLocal, $lt: endLocal } },
        { start: { $lt: startLocal }, end: { $gt: endLocal } },
      ],
      userId: { $in: resolvedUserIds },
      end: { $exists: true, $ne: null },
    },
    { fields: { userId: 1, start: 1, end: 1, status: 1, work: 1 } },
  ).forEachAsync(rec => {
    const work = rec.work ?? inOutOptions.find(opt => opt.id === rec.status)?.work;
    if (!work) return;
    const startMs = rec.start.getTime();
    const endMs = rec.end.getTime();
    // windows are chronological and a record spans only a few of them:
    // binary-search the first candidate window, then walk forward
    let lo = 0;
    let hi = dayWindows.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (dayWindows[mid].winEnd <= startMs) lo = mid + 1;
      else hi = mid;
    }
    for (let w = lo; w < dayWindows.length && dayWindows[w].winStart < endMs; w += 1) {
      const win = dayWindows[w];
      const s = Math.max(startMs, win.winStart);
      const e = Math.min(endMs, win.winEnd);
      if (e > s) win.events.push([s, 1], [e, -1]);
    }
  });

  const days = dayWindows.map(win => {
    // sweep: -1 before +1 at the same instant, so back-to-back periods do not
    // momentarily double-count
    win.events.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    let current = 0;
    let min = Infinity;
    let minAt = win.winStart;
    let max = 0;
    let maxAt = null;
    let personMs = 0;
    let prev = win.winStart;
    let i = 0;
    while (i < win.events.length) {
      const t = win.events[i][0];
      if (t > prev) {
        if (current < min) {
          min = current;
          minAt = prev;
        }
        personMs += current * (t - prev);
        prev = t;
      }
      while (i < win.events.length && win.events[i][0] === t) {
        current += win.events[i][1];
        if (current > max) {
          max = current;
          maxAt = t;
        }
        i += 1;
      }
    }
    if (win.winEnd > prev) {
      if (current < min) {
        min = current;
        minAt = prev;
      }
      personMs += current * (win.winEnd - prev);
    }
    if (min === Infinity) min = 0;
    return {
      date: win.date,
      minConcurrent: min,
      minAt: new Date(minAt),
      maxConcurrent: max,
      maxAt: maxAt === null ? null : new Date(maxAt),
      avgConcurrent: Math.round((personMs / (win.winEnd - win.winStart)) * 100) / 100,
      personMinutes: Math.round(personMs / 60000),
    };
  });

  let overall = null;
  for (const day of days) {
    if (!overall) {
      overall = { minConcurrent: day.minConcurrent, minDate: day.date, maxConcurrent: day.maxConcurrent, maxDate: day.date };
      continue;
    }
    if (day.minConcurrent < overall.minConcurrent) {
      overall.minConcurrent = day.minConcurrent;
      overall.minDate = day.date;
    }
    if (day.maxConcurrent > overall.maxConcurrent) {
      overall.maxConcurrent = day.maxConcurrent;
      overall.maxDate = day.date;
    }
  }

  return { days, overall, meta };
}
