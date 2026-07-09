/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Clients, Projects } from '/src/shared/collections/collections.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';
import resolveUserAddressing from '/src/server/utils/resolveUserAddressing.js';

dayjs.extend(utc);

// Builds the Mongo query + response meta shared by the timesheet explorer
// family (full / totals / grouped) from validated searchTerms. Client pickers
// match the denormalized Times.clientId directly (covers both project entries
// and client-only entries); project pickers match projectId.
export default async function buildTimesQuery(searchTerms) {
  const query = {};
  const meta = {};

  if (searchTerms.projectPickers.length) {
    const clientIdsSel = [...new Set(searchTerms.projectPickers.filter(x => !x.projectId && x.clientId).map(x => x.clientId))];
    const projectIdsSel = [...new Set(searchTerms.projectPickers.filter(x => x.projectId).map(x => x.projectId))];

    const scopeOr = [];
    if (projectIdsSel.length) scopeOr.push({ projectId: { $in: projectIdsSel } });
    if (clientIdsSel.length) scopeOr.push({ clientId: { $in: clientIdsSel } });
    if (scopeOr.length === 1) Object.assign(query, scopeOr[0]);
    else if (scopeOr.length > 1) query.$or = scopeOr;

    const scope = {};
    if (clientIdsSel.length) {
      const clientDocs = await Clients.find({ _id: { $in: clientIdsSel } }, { fields: { name: 1 }, sort: { name: 1 } }).fetchAsync();
      scope.clients = clientDocs.map(c => ({ clientId: c._id, name: c.name }));
    }
    if (projectIdsSel.length) {
      const projectDocs = await Projects.find({ _id: { $in: projectIdsSel } }, { fields: { name: 1, clientId: 1 }, sort: { name: 1 } }).fetchAsync();
      const projectClientDocs = await Clients.find({ _id: { $in: [...new Set(projectDocs.map(p => p.clientId))] } }, { fields: { name: 1 } }).fetchAsync();
      scope.projects = projectDocs.map(p => ({ projectId: p._id, name: p.name, clientName: projectClientDocs.find(c => c._id === p.clientId)?.name }));
    }
    meta.scope = scope;
  }

  if (searchTerms.teamId) {
    const { users: resolvedUsers, userIds: resolvedUserIds, mode } = await resolveUserAddressing({ teamId: searchTerms.teamId });
    query.owner = { $in: resolvedUserIds };
    meta.users = resolvedUsers.map(u => ({ userId: u._id, name: u.name }));
    meta.addressing = { mode, teamId: searchTerms.teamId };
    if (!resolvedUserIds.length) meta.explanation = 'No users matched the given teamId (empty or unknown team)';
  } else if (searchTerms.searchUsers.length) {
    const userIdsUnique = [...new Set(searchTerms.searchUsers)];
    query.owner = { $in: userIdsUnique };
    const userDocs = await Meteor.users.find({ _id: { $in: userIdsUnique } }, { fields: { name: 1 }, sort: { name: 1 } }).fetchAsync();
    meta.users = userDocs.map(u => ({ userId: u._id, name: u.name }));
    meta.addressing = { mode: 'userIds' };
  }

  const periodStart = dayjs.utc(searchTerms.period.start).startOf('day').toDate();
  const periodEnd = dayjs.utc(searchTerms.period.end).endOf('day').toDate();
  query.date = { $gt: periodStart, $lt: periodEnd };
  meta.period = { start: periodStart, end: periodEnd };

  // how much of the queried period has actually elapsed, so callers can flag
  // comparisons made early in a week/month/quarter
  const periodDays = dayjs.utc(searchTerms.period.end).startOf('day').diff(dayjs.utc(searchTerms.period.start).startOf('day'), 'day') + 1;
  const elapsedRaw = dayjs.utc().startOf('day').diff(dayjs.utc(searchTerms.period.start).startOf('day'), 'day') + 1;
  meta.periodInfo = { days: periodDays, elapsedDays: Math.max(0, Math.min(periodDays, elapsedRaw)) };

  if (searchTerms.taskDesc) {
    const str = searchTerms.taskDesc;
    const escaped = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const normalized = normalizeStringForAC(escaped);
    query.taskDescNormalized = new RegExp(normalized);
    meta.taskDesc = searchTerms.taskDesc;
  }

  const tc = searchTerms.tagColor;
  if (tc.green || tc.yellow || tc.red || tc.grey || tc.clear) {
    const colors = [];
    if (tc.green) colors.push('green');
    if (tc.yellow) colors.push('yellow');
    if (tc.red) colors.push('red');
    if (tc.grey) colors.push('grey');
    if (tc.clear) colors.push('');
    query.tagColor = { $in: colors };
    meta.tagColor = searchTerms.tagColor;
  }

  if (searchTerms.tagText) {
    query.tagText = searchTerms.tagText;
    meta.tagText = searchTerms.tagText;
  }

  // planned entries are excluded by default: billable totals should reflect
  // actual tracked work unless the caller explicitly asks otherwise
  const plan = searchTerms.plan || 'actual';
  if (plan === 'actual') query.plan = { $ne: true };
  if (plan === 'planned') query.plan = true;
  meta.plan = plan;

  if (searchTerms.overlapMinutes) {
    query.startMinute = { $lt: searchTerms.overlapMinutes.to };
    query.endMinute = { $gt: searchTerms.overlapMinutes.from };
    meta.overlapMinutes = searchTerms.overlapMinutes;
  }

  const exprConds = [];
  if (searchTerms.minDurationMinutes !== undefined) {
    exprConds.push({ $gte: [{ $subtract: ['$endMinute', '$startMinute'] }, searchTerms.minDurationMinutes] });
    meta.minDurationMinutes = searchTerms.minDurationMinutes;
  }
  if (searchTerms.maxDurationMinutes !== undefined) {
    exprConds.push({ $lte: [{ $subtract: ['$endMinute', '$startMinute'] }, searchTerms.maxDurationMinutes] });
    meta.maxDurationMinutes = searchTerms.maxDurationMinutes;
  }
  if (searchTerms.daysOfWeek) {
    // caller-facing 0=Sunday..6=Saturday; Mongo $dayOfWeek returns 1=Sunday..7=Saturday
    exprConds.push({ $in: [{ $dayOfWeek: '$date' }, searchTerms.daysOfWeek.map(d => d + 1)] });
    meta.daysOfWeek = searchTerms.daysOfWeek;
  }
  if (exprConds.length === 1) query.$expr = exprConds[0];
  else if (exprConds.length > 1) query.$expr = { $and: exprConds };

  return { query, meta };
}
