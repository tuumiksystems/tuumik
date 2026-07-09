/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isoWeek from 'dayjs/plugin/isoWeek';
import { Statuses, Tenant } from '/src/shared/collections/collections.js';
import resolveUserAddressing from '/src/server/utils/resolveUserAddressing.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);

const BUCKET_APPROX_DAYS = { month: 30, week: 7, day: 1 };
const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DOW_ORDER = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
const MAX_BUCKET_ROWS = 2000;

const inputSchema = z.object({
  userIds: z.array(z.string()).min(1).optional(),
  teamId: z.string().min(1).optional(),
  allUsers: z.boolean().optional(),
  startLocal: z.date(),
  endLocal: z.date(),
  groupBy: z.enum(['user', 'team', 'none']).optional(),
  bucketBy: z.enum(['month', 'week', 'day', 'dayOfWeek']).optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1).optional(),
  statusIds: z.array(z.string().min(1)).min(1).optional(),
  top: z.number().int().min(1).max(500).optional(),
  rankBy: z.enum(['minutes', 'periods']).optional(),
  overlapMinutes: z.object({
    from: z.number().int().min(0).max(1440),
    to: z.number().int().min(0).max(1440),
  }).refine(d => d.to > d.from, { message: 'overlapMinutes.to must be greater than overlapMinutes.from' }).optional(),
})
  .refine(d => d.endLocal > d.startLocal, { message: 'endLocal must be after startLocal' })
  .refine(d => [d.userIds, d.teamId, d.allUsers].filter(Boolean).length === 1, { message: 'Provide exactly one of userIds, teamId or allUsers' });

const bucketKeyForDay = (localDayStart, bucketBy) => {
  if (bucketBy === 'day') return localDayStart.format('YYYY-MM-DD');
  if (bucketBy === 'month') return localDayStart.format('YYYY-MM');
  if (bucketBy === 'week') return `${localDayStart.isoWeekYear()}-W${String(localDayStart.isoWeek()).padStart(2, '0')}`;
  return DOW_LABELS[localDayStart.day()];
};

const bucketSort = bucketBy => (a, b) => (bucketBy === 'dayOfWeek' ? DOW_ORDER[a.bucket] - DOW_ORDER[b.bucket] : a.bucket.localeCompare(b.bucket));

// sum of work:true status minutes; "available hours" is the unit most
// questions actually want, so it is precomputed on every totals scope
const workRollup = statusTotals => {
  const workMinutesTotal = statusTotals.reduce((sum, s) => sum + (s.work ? s.minutesTotal : 0), 0);
  return { workMinutesTotal, workHoursTotal: workMinutesTotal / 60 };
};

export default async function loadInOutBoardHistoryTotals(user, args) {
  const { userIds, teamId, allUsers, startLocal, endLocal, bucketBy, daysOfWeek, overlapMinutes, statusIds, top, rankBy } = args;
  if (!user.permissions.inOutView) throw new Meteor.Error('403', 'No permission to view in/out board');

  // only wrap a bare string when userIds was actually provided
  const normalizedIds = userIds == null || Array.isArray(userIds) ? userIds : [userIds];

  const parsed = inputSchema.safeParse({ ...args, userIds: normalizedIds });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const groupBy = args.groupBy || 'user';

  const tenant = await Tenant.findOneAsync();
  const { inOutOptions } = tenant;

  const { users: resolvedUsers, userIds: resolvedUserIds, mode } = await resolveUserAddressing({ userIds: normalizedIds, teamId });

  const meta = {};
  meta.users = resolvedUsers.map(u => ({ userId: u._id, name: u.name }));
  meta.addressing = teamId ? { mode, teamId } : { mode };
  meta.period = { start: startLocal, end: endLocal };
  meta.groupBy = groupBy;
  if (bucketBy) meta.bucketBy = bucketBy;
  if (daysOfWeek) meta.daysOfWeek = daysOfWeek;
  if (overlapMinutes) meta.overlapMinutes = overlapMinutes;
  if (statusIds) meta.statusIds = statusIds;
  if (top) meta.top = top;
  if (rankBy) meta.rankBy = rankBy;
  meta.notes = 'Totals are exact over all matching status records. The currently ongoing (unarchived) status period is not included; use inout_board_current for the live board.';
  if (statusIds) meta.notes += ' Results cover only the requested statusIds; workMinutesTotal sums only the work statuses among them.';
  if (bucketBy || overlapMinutes || daysOfWeek) {
    meta.notes += ' Bucket boundaries, the overlapMinutes window and the daysOfWeek filter use each status record\'s own authored timezone (falling back to the user\'s timezone), i.e. local wall-clock days.';
  }
  if (groupBy === 'team') meta.notes += ' Users in several teams count toward each of their teams, so team totals may sum to more than the overall total. Team membership is current membership.';

  if (!resolvedUserIds.length) {
    meta.explanation = 'No users matched the given addressing (empty team or unknown user ids)';
    return { rows: [], meta, limit: { limitReached: false, explanation: '' }, inOutOptions };
  }

  // row-volume guard: keep responses LLM-sized. Aggregate across users
  // (groupBy "none") or coarsen/shorten when a per-user bucket grid gets big.
  if (bucketBy) {
    const dayCount = dayjs.utc(endLocal).diff(dayjs.utc(startLocal), 'day') + 1;
    const bucketEstimate = bucketBy === 'dayOfWeek' ? 7 : Math.ceil(dayCount / BUCKET_APPROX_DAYS[bucketBy]) + 1;
    const entityEstimate = groupBy === 'none' ? 1 : groupBy === 'team' ? (tenant.teams || []).length + 1 : resolvedUserIds.length;
    if (bucketEstimate * entityEstimate > MAX_BUCKET_ROWS) throw new Meteor.Error('400', 'Too many bucket rows would be returned: use groupBy "none", a coarser bucketBy, a shorter period, or fewer users');
  }

  const matchQuery = {
    $or: [
      { start: { $gt: startLocal, $lt: endLocal } },
      { end: { $gt: startLocal, $lt: endLocal } },
      { start: { $lt: startLocal }, end: { $gt: endLocal } },
    ],
    userId: { $in: resolvedUserIds },
    end: { $exists: true, $ne: null },
  };
  if (statusIds) matchQuery.status = { $in: statusIds };

  // group rows (user x status), not raw docs, count against the limit: totals
  // are computed over all matching status records and are exact at any scale.
  // groupBy "none" merges into one row, so it never needs the cap.
  const groupLimit = Meteor.settings.public.inOutHistoryLimit || 2000;
  meta.limit = groupLimit;
  const limitInfo = { limitReached: false, explanation: '' };

  // plain per-user totals keep the proven aggregation path; bucketBy,
  // overlapMinutes and daysOfWeek need local-day splitting, done in the
  // streaming path below
  let groups;
  if (!bucketBy && !overlapMinutes && !daysOfWeek) {
    groups = await Statuses.rawCollection()
      .aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: { userId: '$userId', status: '$status' },
            // clamp each record to the queried window inside the accumulator
            minutesTotal: { $sum: { $divide: [{ $subtract: [{ $min: ['$end', endLocal] }, { $max: ['$start', startLocal] }] }, 60000] } },
            periodsCount: { $sum: 1 },
            statusText: { $first: '$statusText' },
            work: { $first: '$work' },
          },
        },
        { $sort: { '_id.userId': 1, '_id.status': 1 } },
        // "none" and "team" merge the per-user rows afterwards, so every row is needed
        ...(groupBy === 'user' ? [{ $limit: groupLimit }] : []),
      ])
      .toArray();
  } else {
    // split each record at local midnights (record's authored timezone), clamp
    // each piece to the overlapMinutes wall-clock window, and accumulate per
    // (user, status) and per bucket — streamed, so exact at any record count
    const defaultTz = tenant.defaultTimezone || 'UTC';
    const tzByUser = new Map(resolvedUsers.map(u => [u._id, u.timezone]));
    const accByUserStatus = new Map(); // 'userId|status' -> { minutesTotal, periodsCount, statusText, work, buckets: Map(bucket -> { minutesTotal, periodsCount }) }

    await Statuses.find(matchQuery, { fields: { userId: 1, start: 1, end: 1, status: 1, statusText: 1, work: 1, tz: 1 } }).forEachAsync(rec => {
      const startMs = Math.max(rec.start.getTime(), startLocal.getTime());
      const endMs = Math.min(rec.end.getTime(), endLocal.getTime());
      if (endMs <= startMs) return;
      const tz = rec.tz || tzByUser.get(rec.userId) || defaultTz;

      // per-bucket minutes for this record (a record can touch a bucket via
      // several days, e.g. weekly buckets — merge before counting periods).
      // The local days touched are kept per bucket so dayCount (distinct days
      // with counted time) is exact even across records and statuses.
      const pieces = new Map();
      let recMinutes = 0;
      let dayStart = dayjs(new Date(startMs)).tz(tz).startOf('day');
      while (dayStart.valueOf() < endMs) {
        const dayEnd = dayStart.add(1, 'day');
        // caller-facing weekday convention: 0=Sunday..6=Saturday, local days
        if (daysOfWeek && !daysOfWeek.includes(dayStart.day())) {
          dayStart = dayEnd;
          continue;
        }
        const winStart = overlapMinutes ? dayStart.add(overlapMinutes.from, 'minute') : dayStart;
        const winEnd = overlapMinutes ? dayStart.add(overlapMinutes.to, 'minute') : dayEnd;
        const s = Math.max(startMs, winStart.valueOf());
        const e = Math.min(endMs, winEnd.valueOf());
        if (e > s) {
          const minutes = (e - s) / 60000;
          recMinutes += minutes;
          if (bucketBy) {
            const key = bucketKeyForDay(dayStart, bucketBy);
            let piece = pieces.get(key);
            if (!piece) {
              piece = { minutes: 0, days: new Set() };
              pieces.set(key, piece);
            }
            piece.minutes += minutes;
            piece.days.add(dayStart.format('YYYY-MM-DD'));
          }
        }
        dayStart = dayEnd;
      }
      if (recMinutes <= 0) return; // record has no time inside the window

      const accKey = `${rec.userId}|${rec.status}`;
      let acc = accByUserStatus.get(accKey);
      if (!acc) {
        acc = { _id: { userId: rec.userId, status: rec.status }, minutesTotal: 0, periodsCount: 0, statusText: rec.statusText, work: rec.work, buckets: new Map() };
        accByUserStatus.set(accKey, acc);
      }
      acc.minutesTotal += recMinutes;
      acc.periodsCount += 1;
      for (const [key, piece] of pieces) {
        let bucketAcc = acc.buckets.get(key);
        if (!bucketAcc) {
          bucketAcc = { minutesTotal: 0, periodsCount: 0, days: new Set() };
          acc.buckets.set(key, bucketAcc);
        }
        bucketAcc.minutesTotal += piece.minutes;
        bucketAcc.periodsCount += 1;
        for (const d of piece.days) bucketAcc.days.add(d);
      }
    });

    groups = [...accByUserStatus.values()].sort((a, b) => a._id.userId.localeCompare(b._id.userId) || a._id.status.localeCompare(b._id.status));
    if (groupBy === 'user' && groups.length > groupLimit) groups = groups.slice(0, groupLimit);
  }

  if (groupBy === 'user' && groups.length >= groupLimit) {
    limitInfo.limitReached = true;
    limitInfo.explanation = `Group limit was ${groupLimit} (user x status combinations), this was reached. Some results are likely omitted due to this. Consider making search terms narrower or using groupBy "none".`;
  }

  const statusTotalFromGroup = group => {
    const option = inOutOptions.find(opt => opt.id === group._id.status);
    return {
      statusId: group._id.status,
      minutesTotal: group.minutesTotal,
      hoursTotal: group.minutesTotal / 60,
      periodsCount: group.periodsCount,
      text: group.statusText ?? option?.text,
      work: group.work ?? option?.work,
    };
  };

  if (groupBy === 'none') {
    // merge all users' groups into one overall row (plus per-bucket rollups)
    const byStatus = new Map();
    const activeUserIds = new Set();
    for (const group of groups) {
      activeUserIds.add(group._id.userId);
      let statusAcc = byStatus.get(group._id.status);
      if (!statusAcc) {
        statusAcc = { _id: { status: group._id.status }, minutesTotal: 0, periodsCount: 0, statusText: group.statusText, work: group.work, buckets: new Map() };
        byStatus.set(group._id.status, statusAcc);
      }
      statusAcc.minutesTotal += group.minutesTotal;
      statusAcc.periodsCount += group.periodsCount;
      for (const [key, b] of group.buckets || []) {
        let bucketAcc = statusAcc.buckets.get(key);
        if (!bucketAcc) {
          bucketAcc = { minutesTotal: 0, periodsCount: 0, days: new Set() };
          statusAcc.buckets.set(key, bucketAcc);
        }
        bucketAcc.minutesTotal += b.minutesTotal;
        bucketAcc.periodsCount += b.periodsCount;
        for (const d of b.days || []) bucketAcc.days.add(d);
      }
    }

    const statusTotals = [...byStatus.values()].sort((a, b) => a._id.status.localeCompare(b._id.status)).map(statusTotalFromGroup);
    // uniform response shape: groupBy "none" is a single all-users row
    const overallTotals = {
      scope: 'all',
      userCount: activeUserIds.size,
      ...workRollup(statusTotals),
      statusTotals,
    };
    if (bucketBy) {
      const bucketMap = new Map(); // bucket -> statusId -> { minutesTotal, periodsCount, statusText, work }
      const bucketDays = new Map(); // bucket -> Set of local days with counted time, across statuses
      for (const statusAcc of byStatus.values()) {
        for (const [key, b] of statusAcc.buckets) {
          let perStatus = bucketMap.get(key);
          if (!perStatus) {
            perStatus = new Map();
            bucketMap.set(key, perStatus);
            bucketDays.set(key, new Set());
          }
          perStatus.set(statusAcc._id.status, { _id: { status: statusAcc._id.status }, minutesTotal: b.minutesTotal, periodsCount: b.periodsCount, statusText: statusAcc.statusText, work: statusAcc.work });
          for (const d of b.days || []) bucketDays.get(key).add(d);
        }
      }
      overallTotals.buckets = [...bucketMap.entries()].map(([key, perStatus]) => {
        const bucketStatusTotals = [...perStatus.values()].sort((a, b) => a._id.status.localeCompare(b._id.status)).map(statusTotalFromGroup);
        return { bucket: key, dayCount: bucketDays.get(key).size, ...workRollup(bucketStatusTotals), statusTotals: bucketStatusTotals };
      }).sort(bucketSort(bucketBy));
    }
    return { rows: [overallTotals], meta, limit: limitInfo, inOutOptions };
  }

  // groupBy "team": pre-merge the per-user groups into per-team groups; each
  // user's rows count toward every team they belong to (mirrors the Times-side
  // team semantics), users with no team land in a null-team row
  const usersByTeam = new Map(); // teamId -> Set of userIds with any counted time
  if (groupBy === 'team') {
    const inTeamsById = new Map(resolvedUsers.map(u => [u._id, u.inTeams || []]));
    const accByTeamStatus = new Map();
    for (const group of groups) {
      const inTeams = inTeamsById.get(group._id.userId) || [];
      for (const tId of inTeams.length ? inTeams : [null]) {
        let teamUsers = usersByTeam.get(tId);
        if (!teamUsers) {
          teamUsers = new Set();
          usersByTeam.set(tId, teamUsers);
        }
        teamUsers.add(group._id.userId);
        const accKey = `${tId}|${group._id.status}`;
        let acc = accByTeamStatus.get(accKey);
        if (!acc) {
          acc = { _id: { teamId: tId, status: group._id.status }, minutesTotal: 0, periodsCount: 0, statusText: group.statusText, work: group.work, buckets: new Map() };
          accByTeamStatus.set(accKey, acc);
        }
        acc.minutesTotal += group.minutesTotal;
        acc.periodsCount += group.periodsCount;
        for (const [key, b] of group.buckets || []) {
          let bucketAcc = acc.buckets.get(key);
          if (!bucketAcc) {
            bucketAcc = { minutesTotal: 0, periodsCount: 0, days: new Set() };
            acc.buckets.set(key, bucketAcc);
          }
          bucketAcc.minutesTotal += b.minutesTotal;
          bucketAcc.periodsCount += b.periodsCount;
          for (const d of b.days || []) bucketAcc.days.add(d);
        }
      }
    }
    groups = [...accByTeamStatus.values()].sort((a, b) => String(a._id.teamId).localeCompare(String(b._id.teamId)) || a._id.status.localeCompare(b._id.status));
  }

  // build per-entity (user or team) totals from the groups
  const tenantTeams = tenant.teams || [];
  const entityKeyOf = group => (groupBy === 'team' ? group._id.teamId : group._id.userId);
  const totalsRows = [];
  for (const group of groups) {
    const entityKey = entityKeyOf(group);
    let entry = totalsRows.find(r => (groupBy === 'team' ? r.teamId : r.userId) === entityKey);
    if (!entry) {
      entry = groupBy === 'team'
        ? {
          teamId: entityKey,
          teamName: entityKey === null ? 'No team' : tenantTeams.find(t => t.id === entityKey)?.name ?? null,
          userCount: usersByTeam.get(entityKey)?.size ?? 0,
          statusTotals: [],
        }
        : {
          userId: entityKey,
          name: resolvedUsers.find(u => u._id === entityKey)?.name,
          statusTotals: [],
        };
      if (bucketBy) {
        entry.bucketMap = new Map();
        entry.bucketDays = new Map();
      }
      totalsRows.push(entry);
    }
    entry.statusTotals.push(statusTotalFromGroup(group));
    if (bucketBy) {
      for (const [key, b] of group.buckets) {
        let perStatus = entry.bucketMap.get(key);
        if (!perStatus) {
          perStatus = new Map();
          entry.bucketMap.set(key, perStatus);
          entry.bucketDays.set(key, new Set());
        }
        perStatus.set(group._id.status, { _id: { status: group._id.status }, minutesTotal: b.minutesTotal, periodsCount: b.periodsCount, statusText: group.statusText, work: group.work });
        for (const d of b.days || []) entry.bucketDays.get(key).add(d);
      }
    }
  }
  for (const entry of totalsRows) {
    Object.assign(entry, workRollup(entry.statusTotals));
    // totals across ALL returned statuses (not just work ones) - the ranking
    // units for "who was X the most" questions when statusIds narrows the set
    entry.minutesTotal = entry.statusTotals.reduce((sum, s) => sum + s.minutesTotal, 0);
    entry.hoursTotal = entry.minutesTotal / 60;
    entry.periodsTotal = entry.statusTotals.reduce((sum, s) => sum + s.periodsCount, 0);
    if (bucketBy) {
      entry.buckets = [...entry.bucketMap.entries()].map(([key, perStatus]) => {
        const bucketStatusTotals = [...perStatus.values()].sort((a, b) => a._id.status.localeCompare(b._id.status)).map(statusTotalFromGroup);
        return { bucket: key, dayCount: entry.bucketDays.get(key).size, ...workRollup(bucketStatusTotals), statusTotals: bucketStatusTotals };
      }).sort(bucketSort(bucketBy));
      delete entry.bucketMap;
      delete entry.bucketDays;
    }
  }
  // /build per-entity totals from the groups

  // top-N mode: rank rows by total minutes (or by periodsTotal with
  // rankBy "periods", for how-often/toggling questions) and return only the
  // leaders, so ranking questions stay LLM-sized at any user count. Without
  // top the response keeps its stable order (sorted by userId/teamId).
  let moreRows = false;
  if (top) {
    const rankValue = rankBy === 'periods' ? r => r.periodsTotal : r => r.minutesTotal;
    totalsRows.sort((a, b) => rankValue(b) - rankValue(a) || String(a.userId ?? a.teamId).localeCompare(String(b.userId ?? b.teamId)));
    moreRows = totalsRows.length > top;
    if (moreRows) totalsRows.length = top;
  }

  return {
    rows: totalsRows,
    ...(top ? { moreRows } : {}),
    meta,
    limit: limitInfo,
    inOutOptions,
  };
}
