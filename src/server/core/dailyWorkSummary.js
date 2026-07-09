/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isoWeek from 'dayjs/plugin/isoWeek';
import { Times, Statuses, Tenant } from '/src/shared/collections/collections.js';
import resolveUserAddressing from '/src/server/utils/resolveUserAddressing.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);

const dayString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Day must be a YYYY-MM-DD string');

const inputSchema = z.object({
  userIds: z.array(z.string()).min(1).optional(),
  teamId: z.string().min(1).optional(),
  allUsers: z.boolean().optional(),
  startDay: dayString,
  endDay: dayString,
  activeAfterMinute: z.number().int().min(0).max(1440).optional(),
  activeBeforeMinute: z.number().int().min(1).max(1440).optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1).optional(),
  maxTotalMinutes: z.number().int().min(0).max(1440).optional(),
  minTotalMinutes: z.number().int().min(0).max(1440).optional(),
  overlapMinutes: z.object({
    from: z.number().int().min(0).max(1440),
    to: z.number().int().min(1).max(1440),
  }).refine(d => d.to > d.from, { message: 'overlapMinutes.to must be greater than overlapMinutes.from' }).optional(),
  rollup: z.enum(['user', 'user-month', 'user-week', 'team', 'none']).optional(),
})
  .refine(d => [d.userIds, d.teamId, d.allUsers].filter(Boolean).length === 1, { message: 'Provide exactly one of userIds, teamId or allUsers' })
  .refine(d => d.endDay >= d.startDay, { message: 'endDay must not be before startDay' })
  .refine(d => d.minTotalMinutes === undefined || d.maxTotalMinutes === undefined || d.minTotalMinutes <= d.maxTotalMinutes, { message: 'minTotalMinutes must not exceed maxTotalMinutes' });

// wall-clock minute of an instant in a record's timezone, as a pipeline expression
const minuteOfDayExpr = (dateExpr, tzExpr) => ({
  $add: [{ $multiply: [{ $hour: { date: dateExpr, timezone: tzExpr } }, 60] }, { $minute: { date: dateExpr, timezone: tzExpr } }],
});

export default async function dailyWorkSummary(user, args) {
  if (!user.permissions.composer) throw new Meteor.Error('403', 'No permission to access composer');

  const normalizedIds = args.userIds == null || Array.isArray(args.userIds) ? args.userIds : [args.userIds];
  const parsed = inputSchema.safeParse({ ...args, userIds: normalizedIds });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  // the overlapMinutes wall-clock window, named `window` internally for brevity
  const { teamId, startDay, endDay, activeAfterMinute, activeBeforeMinute, daysOfWeek, maxTotalMinutes, minTotalMinutes, overlapMinutes: window, rollup } = parsed.data;

  const tenant = await Tenant.findOneAsync();
  const { users: resolvedUsers, userIds: resolvedUserIds, mode } = await resolveUserAddressing({ userIds: normalizedIds, teamId });
  const userById = new Map(resolvedUsers.map(u => [u._id, u]));

  const limit = Meteor.settings.public.dailyWorkSummaryLimit || 10000;
  const dayCount = dayjs.utc(endDay).diff(dayjs.utc(startDay), 'day') + 1;

  const filtersEcho = {};
  for (const key of ['activeAfterMinute', 'activeBeforeMinute', 'daysOfWeek', 'maxTotalMinutes', 'minTotalMinutes', 'overlapMinutes', 'rollup']) {
    if (parsed.data[key] !== undefined) filtersEcho[key] = parsed.data[key];
  }

  const meta = {
    users: resolvedUsers.map(u => ({ userId: u._id, name: u.name })),
    addressing: teamId ? { mode, teamId } : { mode },
    period: { startDay, endDay },
    filters: filtersEcho,
    notes: 'All minute values are local wall-clock minutes from midnight (0-1440). Billable times exclude planned (plan:true) entries. In/out covers only work statuses (work: true). Days with no recorded activity have no row unless maxTotalMinutes enables zero-rows.',
  };

  const emptyResult = { days: [], meta, limit: { times: { limitReached: false, explanation: '' }, inOut: { limitReached: false, explanation: '' } } };
  if (!resolvedUserIds.length) {
    meta.explanation = 'No users matched the given addressing (empty team or unknown user ids)';
    return emptyResult;
  }

  // matrix-mode guard: the zero-row matrix must stay LLM-sized
  if (maxTotalMinutes !== undefined) {
    const matrixDays = daysOfWeek ? Math.ceil((dayCount / 7) * daysOfWeek.length) + daysOfWeek.length : dayCount;
    if (resolvedUsers.length * matrixDays > limit) throw new Meteor.Error('400', 'users x days matrix too large: narrow the users or the period');
  }

  // ---- Times side: one aggregation group per user per day ----
  const timesRows = await Times.rawCollection()
    .aggregate([
      {
        $match: {
          owner: { $in: resolvedUserIds },
          date: { $gt: dayjs.utc(startDay).startOf('day').toDate(), $lt: dayjs.utc(endDay).endOf('day').toDate() },
          plan: { $ne: true },
        },
      },
      {
        $group: {
          // date is a UTC day marker of the local calendar day - no timezone param needed
          _id: { owner: '$owner', day: { $dateToString: { format: '%Y-%m-%d', date: '$date' } } },
          firstStartMinute: { $min: '$startMinute' },
          lastEndMinute: { $max: '$endMinute' },
          totalMinutes: { $sum: { $subtract: ['$endMinute', '$startMinute'] } },
          entryCount: { $sum: 1 },
          // billable minutes inside the wall-clock window, mirroring the in/out
          // side's workMinutesInWindow so both sides of a window question align
          ...(window ? { minutesInWindow: { $sum: { $max: [0, { $subtract: [{ $min: ['$endMinute', window.to] }, { $max: ['$startMinute', window.from] }] }] } } } : {}),
        },
      },
      { $sort: { '_id.day': 1, '_id.owner': 1 } },
      { $limit: limit },
    ])
    .toArray();

  const timesLimit = { limitReached: timesRows.length >= limit, explanation: '' };
  if (timesLimit.limitReached) timesLimit.explanation = `Day-row limit of ${limit} reached on the times side; the period tail is missing. Narrow the users/period or split the period into chunks.`;

  const timesMap = new Map();
  for (const row of timesRows) {
    timesMap.set(`${row._id.owner}|${row._id.day}`, {
      firstStartMinute: row.firstStartMinute,
      lastEndMinute: row.lastEndMinute,
      totalMinutes: row.totalMinutes,
      entryCount: row.entryCount,
      ...(window ? { minutesInWindow: row.minutesInWindow } : {}),
    });
  }

  // ---- Statuses side ----
  // window with a margin so records authored in any timezone whose local day
  // falls in the period are caught (pattern: teamMonitorLoad.js)
  const windowStart = dayjs.utc(startDay).startOf('day').subtract(14, 'hour').toDate();
  const windowEnd = dayjs.utc(endDay).endOf('day').add(14, 'hour').toDate();
  const statusBaseMatch = {
    $or: [
      { start: { $gt: windowStart, $lt: windowEnd } },
      { end: { $gt: windowStart, $lt: windowEnd } },
      { start: { $lt: windowStart }, end: { $gt: windowEnd } },
    ],
    userId: { $in: resolvedUserIds },
    work: true,
    end: { $exists: true, $ne: null },
    start: { $exists: true, $ne: null },
  };

  const startMinExpr = minuteOfDayExpr('$start', '$tzEff');
  const endIsSameDayExpr = { $eq: [{ $dateToString: { format: '%Y-%m-%d', date: '$end', timezone: '$tzEff' } }, '$startDayLocal'] };
  // a record ending exactly at local midnight belongs to the day it closes -> 1440
  const endMinExpr = { $cond: [endIsSameDayExpr, minuteOfDayExpr('$end', '$tzEff'), 1440] };

  const statusGroupAccums = {
    workMinutes: { $sum: { $round: { $divide: [{ $subtract: ['$end', '$start'] }, 60000] } } }, // real elapsed -> DST-correct
    firstWorkStartMinute: { $min: startMinExpr },
    lastWorkEndMinute: { $max: endMinExpr },
    tzs: { $addToSet: '$tzEff' },
  };
  if (window) {
    statusGroupAccums.workMinutesInWindow = {
      $sum: { $max: [0, { $subtract: [{ $min: [endMinExpr, window.to] }, { $max: [startMinExpr, window.from] }] }] },
    };
  }

  // same-local-day records (the vast majority) fully in the pipeline
  let inOutRows;
  try {
    inOutRows = await Statuses.rawCollection()
      .aggregate([
        { $match: statusBaseMatch },
        { $addFields: { tzEff: { $ifNull: ['$tz', 'UTC'] } } },
        {
          $addFields: {
            startDayLocal: { $dateToString: { format: '%Y-%m-%d', date: '$start', timezone: '$tzEff' } },
            // end - 1ms for day membership: a record ending exactly at local
            // midnight belongs to the day it closes
            endDayLocal: { $dateToString: { format: '%Y-%m-%d', date: { $subtract: ['$end', 1] }, timezone: '$tzEff' } },
          },
        },
        { $match: { $expr: { $eq: ['$startDayLocal', '$endDayLocal'] } } },
        {
          $group: {
            _id: { userId: '$userId', day: '$startDayLocal' },
            ...statusGroupAccums,
          },
        },
        { $sort: { '_id.day': 1, '_id.userId': 1 } },
        { $limit: limit },
      ])
      .toArray();
  } catch (err) {
    throw new Meteor.Error('500', `In/out aggregation failed (invalid timezone value on a status record?): ${err.message}`);
  }

  const inOutLimit = { limitReached: inOutRows.length >= limit, explanation: '' };
  if (inOutLimit.limitReached) inOutLimit.explanation = `Day-row limit of ${limit} reached on the in/out side; the period tail is missing. Narrow the users/period or split the period into chunks.`;

  const inOutMap = new Map();
  for (const row of inOutRows) {
    if (row._id.day < startDay || row._id.day > endDay) continue; // margin over-fetch
    inOutMap.set(`${row._id.userId}|${row._id.day}`, {
      workMinutes: row.workMinutes,
      firstWorkStartMinute: row.firstWorkStartMinute,
      lastWorkEndMinute: row.lastWorkEndMinute,
      ...(window ? { workMinutesInWindow: row.workMinutesInWindow } : {}),
      continuedFromPreviousDay: false,
      continuedPastMidnight: false,
      includesOngoingStatus: false,
      tz: row.tzs[0],
      ...(row.tzs.length > 1 ? { mixedTimezones: true } : {}),
    });
  }

  // midnight-crossing records (rare) split per local day in JS
  const crossers = await Statuses.rawCollection()
    .aggregate([
      { $match: statusBaseMatch },
      { $addFields: { tzEff: { $ifNull: ['$tz', 'UTC'] } } },
      {
        $addFields: {
          startDayLocal: { $dateToString: { format: '%Y-%m-%d', date: '$start', timezone: '$tzEff' } },
          endDayLocal: { $dateToString: { format: '%Y-%m-%d', date: { $subtract: ['$end', 1] }, timezone: '$tzEff' } },
        },
      },
      { $match: { $expr: { $ne: ['$startDayLocal', '$endDayLocal'] } } },
      { $limit: 1000 },
    ])
    .toArray();

  const mergeSegment = (userId, dayKey, seg) => {
    if (dayKey < startDay || dayKey > endDay) return;
    const key = `${userId}|${dayKey}`;
    let entry = inOutMap.get(key);
    if (!entry) {
      entry = {
        workMinutes: 0,
        firstWorkStartMinute: seg.startMinute,
        lastWorkEndMinute: seg.endMinute,
        ...(window ? { workMinutesInWindow: 0 } : {}),
        continuedFromPreviousDay: false,
        continuedPastMidnight: false,
        includesOngoingStatus: false,
        tz: seg.tz,
      };
      inOutMap.set(key, entry);
    }
    entry.workMinutes += seg.workMinutes;
    entry.firstWorkStartMinute = Math.min(entry.firstWorkStartMinute, seg.startMinute);
    entry.lastWorkEndMinute = Math.max(entry.lastWorkEndMinute, seg.endMinute);
    if (window) entry.workMinutesInWindow += Math.max(0, Math.min(seg.endMinute, window.to) - Math.max(seg.startMinute, window.from));
    if (seg.continuedFromPreviousDay) entry.continuedFromPreviousDay = true;
    if (seg.continuedPastMidnight) entry.continuedPastMidnight = true;
    if (seg.virtual) entry.includesOngoingStatus = true;
    if (entry.tz !== seg.tz) entry.mixedTimezones = true;
  };

  // walk a record from start to end, splitting at each local midnight
  // (calendar-day add -> DST-safe)
  const splitRecord = record => {
    let recTz = record.tz || userById.get(record.userId)?.timezone || tenant?.defaultTimezone || 'UTC';
    let cursor;
    try {
      cursor = dayjs(record.start).tz(recTz);
    } catch (err) {
      recTz = 'UTC';
      cursor = dayjs(record.start).tz(recTz);
    }
    const endAbs = dayjs(record.end);
    let isFirst = true;
    while (cursor.valueOf() < endAbs.valueOf()) {
      const dayKey = cursor.format('YYYY-MM-DD');
      const nextMidnight = dayjs.tz(dayKey, recTz).add(1, 'day');
      const segEnd = endAbs.valueOf() < nextMidnight.valueOf() ? endAbs : nextMidnight;
      const endsAtMidnight = segEnd.valueOf() === nextMidnight.valueOf();
      const segEndLocal = endsAtMidnight ? 1440 : segEnd.tz(recTz).hour() * 60 + segEnd.tz(recTz).minute();
      mergeSegment(record.userId, dayKey, {
        startMinute: isFirst ? cursor.hour() * 60 + cursor.minute() : 0,
        endMinute: segEndLocal,
        workMinutes: Math.round((segEnd.valueOf() - cursor.valueOf()) / 60000),
        continuedFromPreviousDay: !isFirst,
        continuedPastMidnight: endsAtMidnight,
        virtual: !!record.virtual,
        tz: recTz,
      });
      cursor = nextMidnight.tz(recTz);
      isFirst = false;
    }
  };

  for (const record of crossers) splitRecord(record);

  // virtual ongoing status: the live (unarchived) period on each user doc,
  // included so ranges ending "now" do not undercount today
  const workStatusIds = new Set((tenant?.inOutOptions || []).filter(o => o.work).map(o => o.id));
  const now = new Date();
  for (const resolvedUser of resolvedUsers) {
    if (!workStatusIds.has(resolvedUser.inOutStatus)) continue;
    if (!resolvedUser.inOutUpdateAt || resolvedUser.inOutUpdateAt >= now) continue;
    splitRecord({
      userId: resolvedUser._id,
      start: resolvedUser.inOutUpdateAt,
      end: now,
      tz: resolvedUser.timezone,
      virtual: true,
    });
  }

  // ---- rows ----
  let rows = [];
  const keys = new Set([...timesMap.keys(), ...inOutMap.keys()]);
  for (const key of keys) {
    const [userId, day] = key.split('|');
    if (day < startDay || day > endDay) continue;
    rows.push({
      day,
      dayOfWeek: dayjs.utc(day).day(),
      userId,
      userName: userById.get(userId)?.name,
      times: timesMap.get(key) || null,
      inOut: inOutMap.get(key) || null,
    });
  }

  // zero-row matrix mode: absence must be visible as explicit rows
  if (maxTotalMinutes !== undefined) {
    for (const resolvedUser of resolvedUsers) {
      const createdDay = resolvedUser.createdAt ? dayjs.utc(resolvedUser.createdAt).format('YYYY-MM-DD') : null;
      for (let i = 0; i < dayCount; i += 1) {
        const d = dayjs.utc(startDay).add(i, 'day');
        const dayKey = d.format('YYYY-MM-DD');
        if (daysOfWeek && !daysOfWeek.includes(d.day())) continue;
        if (createdDay && dayKey < createdDay) continue; // joined mid-period
        if (keys.has(`${resolvedUser._id}|${dayKey}`)) continue;
        rows.push({
          day: dayKey,
          dayOfWeek: d.day(),
          userId: resolvedUser._id,
          userName: resolvedUser.name,
          times: null,
          inOut: null,
          noActivity: true,
        });
      }
    }
  }

  // ---- qualifying filters (ANDed) ----
  if (daysOfWeek) rows = rows.filter(r => daysOfWeek.includes(r.dayOfWeek));
  if (activeAfterMinute !== undefined) rows = rows.filter(r => (r.times && r.times.lastEndMinute > activeAfterMinute) || (r.inOut && r.inOut.lastWorkEndMinute > activeAfterMinute));
  if (activeBeforeMinute !== undefined) rows = rows.filter(r => (r.times && r.times.firstStartMinute < activeBeforeMinute) || (r.inOut && r.inOut.firstWorkStartMinute < activeBeforeMinute));
  if (maxTotalMinutes !== undefined) rows = rows.filter(r => (r.times?.totalMinutes || 0) <= maxTotalMinutes);
  if (minTotalMinutes !== undefined) rows = rows.filter(r => (r.times?.totalMinutes || 0) >= minTotalMinutes);

  rows.sort((a, b) => a.day.localeCompare(b.day) || (a.userName || '').localeCompare(b.userName || ''));

  const limitInfo = { times: timesLimit, inOut: inOutLimit };

  // ---- rollup: fold the surviving day rows server-side ----
  if (rollup) {
    // a day row folds into one key (per user, or one firm-wide row) — except
    // rollup "team", where a multi-team user's row counts toward each team
    const keysFor = row => {
      if (rollup === 'user') return [row.userId];
      if (rollup === 'user-month') return [`${row.userId}|${row.day.slice(0, 7)}`];
      if (rollup === 'user-week') {
        const d = dayjs.utc(row.day);
        return [`${row.userId}|${d.isoWeekYear()}-W${String(d.isoWeek()).padStart(2, '0')}`];
      }
      if (rollup === 'none') return ['all'];
      const inTeams = userById.get(row.userId)?.inTeams || [];
      return inTeams.length ? inTeams : [null];
    };
    const tenantTeams = tenant?.teams || [];
    const identityFor = key => {
      if (rollup === 'none') return { scope: 'all' };
      if (rollup === 'team') return { teamId: key, teamName: key === null ? 'No team' : tenantTeams.find(t => t.id === key)?.name ?? null };
      return null; // per-user rollups take identity from the row instead
    };
    const folded = new Map();
    const foldInto = (key, row) => {
      let entry = folded.get(key);
      if (!entry) {
        entry = {
          ...(identityFor(key) ?? { userId: row.userId, userName: row.userName }),
          ...(rollup === 'user-month' || rollup === 'user-week' ? { bucket: key.split('|')[1] } : {}),
          users: new Set(),
          qualifyingDayCount: 0,
          daysWithTimes: 0,
          daysWithInOut: 0,
          // billed-vs-board mismatch counters, for anomaly sweeps without raw day rows
          daysBilledWithoutBoard: 0,
          daysOnBoardWithoutBilling: 0,
          ...(window ? { daysBilledWithoutBoardInWindow: 0, daysOnBoardWithoutBillingInWindow: 0 } : {}),
          times: { totalMinutes: 0, entryCount: 0, ...(window ? { minutesInWindow: 0 } : {}) },
          inOut: { workMinutes: 0, ...(window ? { workMinutesInWindow: 0 } : {}) },
          firstDay: row.day,
          lastDay: row.day,
          continuedPastMidnightDays: 0,
          includesOngoingStatus: false,
          firstStartSum: 0,
          lastEndSum: 0,
          firstWorkStartSum: 0,
          lastWorkEndSum: 0,
        };
        folded.set(key, entry);
      }
      entry.users.add(row.userId);
      entry.qualifyingDayCount += 1;
      if (row.day < entry.firstDay) entry.firstDay = row.day;
      if (row.day > entry.lastDay) entry.lastDay = row.day;
      if (row.times) {
        entry.daysWithTimes += 1;
        entry.times.totalMinutes += row.times.totalMinutes;
        entry.times.entryCount += row.times.entryCount;
        if (window) entry.times.minutesInWindow += row.times.minutesInWindow || 0;
        entry.firstStartSum += row.times.firstStartMinute;
        entry.lastEndSum += row.times.lastEndMinute;
      }
      const billed = !!row.times && row.times.totalMinutes > 0;
      const onBoard = !!row.inOut && row.inOut.workMinutes > 0;
      if (billed && !onBoard) entry.daysBilledWithoutBoard += 1;
      if (onBoard && !billed) entry.daysOnBoardWithoutBilling += 1;
      if (window) {
        const billedInWindow = !!row.times && (row.times.minutesInWindow || 0) > 0;
        const onBoardInWindow = !!row.inOut && (row.inOut.workMinutesInWindow || 0) > 0;
        if (billedInWindow && !onBoardInWindow) entry.daysBilledWithoutBoardInWindow += 1;
        if (onBoardInWindow && !billedInWindow) entry.daysOnBoardWithoutBillingInWindow += 1;
      }
      if (row.inOut) {
        entry.daysWithInOut += 1;
        entry.inOut.workMinutes += row.inOut.workMinutes;
        if (window) entry.inOut.workMinutesInWindow += row.inOut.workMinutesInWindow || 0;
        if (row.inOut.continuedPastMidnight) entry.continuedPastMidnightDays += 1;
        if (row.inOut.includesOngoingStatus) entry.includesOngoingStatus = true;
        entry.firstWorkStartSum += row.inOut.firstWorkStartMinute;
        entry.lastWorkEndSum += row.inOut.lastWorkEndMinute;
      }
    };
    for (const row of rows) for (const key of keysFor(row)) foldInto(key, row);
    const rollupRows = [...folded.values()].map(({ users, firstStartSum, lastEndSum, firstWorkStartSum, lastWorkEndSum, ...entry }) => ({
      ...entry,
      // per-user rollups always have userCount 1; team/none folds report how
      // many distinct users contributed day rows
      ...(rollup === 'team' || rollup === 'none' ? { userCount: users.size } : {}),
      times: {
        ...entry.times,
        avgMinutesPerActiveDay: entry.daysWithTimes ? Math.round(entry.times.totalMinutes / entry.daysWithTimes) : null,
        avgFirstStartMinute: entry.daysWithTimes ? Math.round(firstStartSum / entry.daysWithTimes) : null,
        avgLastEndMinute: entry.daysWithTimes ? Math.round(lastEndSum / entry.daysWithTimes) : null,
      },
      inOut: {
        ...entry.inOut,
        avgWorkMinutesPerActiveDay: entry.daysWithInOut ? Math.round(entry.inOut.workMinutes / entry.daysWithInOut) : null,
        avgFirstWorkStartMinute: entry.daysWithInOut ? Math.round(firstWorkStartSum / entry.daysWithInOut) : null,
        avgLastWorkEndMinute: entry.daysWithInOut ? Math.round(lastWorkEndSum / entry.daysWithInOut) : null,
      },
    }));
    rollupRows.sort((a, b) => (a.userName || a.teamName || '').localeCompare(b.userName || b.teamName || '') || (a.bucket || '').localeCompare(b.bucket || ''));
    meta.notes += ' Rollup rows fold the qualifying day rows; qualifyingDayCount counts the user-day rows that passed all filters. Average start and end minutes are computed over each side\'s active days only (daysWithTimes / daysWithInOut). daysBilledWithoutBoard counts days with billable time but no work status on the board (and vice versa for daysOnBoardWithoutBilling); the InWindow variants apply the same check inside the window only.';
    if (rollup === 'team') meta.notes += ' Users in several teams count toward each of their teams, so team rollups may sum to more than the firm total.';
    return { rollup: rollupRows, meta, limit: limitInfo };
  }

  return { days: rows, meta, limit: limitInfo };
}
