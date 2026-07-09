/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import timesheetExplorerFull from '/src/server/core/timesheetExplorerFull.js';
import timesheetExplorerGrouped from '/src/server/core/timesheetExplorerGrouped.js';
import timesheetExplorerOverlaps from '/src/server/core/timesheetExplorerOverlaps.js';
import composerFull from '/src/server/core/composerFull.js';
import composerTagColor from '/src/server/core/composerTagColor.js';
import composerTagText from '/src/server/core/composerTagText.js';
import composerExporter from '/src/server/core/composerExporter.js';

WebApp.handlers.post('/api/timesheet-explorer/full', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'timesheetExplorerFull');
  if (!user) return;
  const body = req.body;
  if (!body.startDate) throw new Meteor.Error('400', 'startDate is required');
  if (!body.endDate) throw new Meteor.Error('400', 'endDate is required');
  const projectPickers = [];
  for (const clientId of body.clientIds || []) projectPickers.push({ clientId });
  for (const projectId of body.projectIds || []) projectPickers.push({ projectId });
  const searchTerms = {
    projectPickers,
    searchUsers: body.userIds || [],
    period: {
      start: new Date(body.startDate),
      end: new Date(body.endDate),
    },
    taskDesc: body.taskDesc || '',
    tagColor: {
      green: body.tagColor?.green || false,
      yellow: body.tagColor?.yellow || false,
      red: body.tagColor?.red || false,
      grey: body.tagColor?.grey || false,
      clear: body.tagColor?.clear || false,
    },
    tagText: body.tagText || '',
    sort: {
      first: body.sort?.first || 'date',
      second: body.sort?.second || 'none',
      third: body.sort?.third || 'none',
    },
  };
  if (body.limit) searchTerms.limit = body.limit;
  if (body.skip) searchTerms.skip = body.skip;
  if (body.teamId) searchTerms.teamId = body.teamId;
  if (body.plan) searchTerms.plan = body.plan;
  if (body.overlapMinutes) searchTerms.overlapMinutes = { from: body.overlapMinutes.from, to: body.overlapMinutes.to };
  if (body.minDurationMinutes !== undefined) searchTerms.minDurationMinutes = body.minDurationMinutes;
  if (body.maxDurationMinutes !== undefined) searchTerms.maxDurationMinutes = body.maxDurationMinutes;
  if (body.daysOfWeek) searchTerms.daysOfWeek = body.daysOfWeek;
  const result = await timesheetExplorerFull(user, searchTerms);
  res.json(result);
}));

WebApp.handlers.post('/api/timesheet-explorer/grouped', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'timesheetExplorerGrouped');
  if (!user) return;
  const body = req.body;
  if (!body.startDate) throw new Meteor.Error('400', 'startDate is required');
  if (!body.endDate) throw new Meteor.Error('400', 'endDate is required');
  if (!body.groupBy) throw new Meteor.Error('400', 'groupBy is required');
  const projectPickers = [];
  for (const clientId of body.clientIds || []) projectPickers.push({ clientId });
  for (const projectId of body.projectIds || []) projectPickers.push({ projectId });
  const searchTerms = {
    projectPickers,
    searchUsers: body.userIds || [],
    period: {
      start: new Date(body.startDate),
      end: new Date(body.endDate),
    },
    taskDesc: body.taskDesc || '',
    tagColor: {
      green: body.tagColor?.green || false,
      yellow: body.tagColor?.yellow || false,
      red: body.tagColor?.red || false,
      grey: body.tagColor?.grey || false,
      clear: body.tagColor?.clear || false,
    },
    tagText: body.tagText || '',
    groupBy: body.groupBy,
  };
  if (body.teamId) searchTerms.teamId = body.teamId;
  if (body.plan) searchTerms.plan = body.plan;
  if (body.overlapMinutes) searchTerms.overlapMinutes = { from: body.overlapMinutes.from, to: body.overlapMinutes.to };
  if (body.minDurationMinutes !== undefined) searchTerms.minDurationMinutes = body.minDurationMinutes;
  if (body.maxDurationMinutes !== undefined) searchTerms.maxDurationMinutes = body.maxDurationMinutes;
  if (body.daysOfWeek) searchTerms.daysOfWeek = body.daysOfWeek;
  if (body.bucketBy) searchTerms.bucketBy = body.bucketBy;
  if (body.top !== undefined) searchTerms.top = body.top;
  if (body.includeEmpty !== undefined) searchTerms.includeEmpty = body.includeEmpty;
  if (body.durationStats !== undefined) searchTerms.durationStats = body.durationStats;
  if (body.lagStats !== undefined) searchTerms.lagStats = body.lagStats;
  if (body.comparePeriod) {
    if (!body.comparePeriod.startDate || !body.comparePeriod.endDate) throw new Meteor.Error('400', 'comparePeriod requires startDate and endDate');
    searchTerms.comparePeriod = { start: new Date(body.comparePeriod.startDate), end: new Date(body.comparePeriod.endDate) };
  }
  if (body.comparePlan !== undefined) searchTerms.comparePlan = body.comparePlan;
  const result = await timesheetExplorerGrouped(user, searchTerms);
  res.json(result);
}));

WebApp.handlers.post('/api/timesheet-explorer/overlaps', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'timesheetExplorerOverlaps');
  if (!user) return;
  const body = req.body;
  if (!body.startDate) throw new Meteor.Error('400', 'startDate is required');
  if (!body.endDate) throw new Meteor.Error('400', 'endDate is required');
  const projectPickers = [];
  for (const clientId of body.clientIds || []) projectPickers.push({ clientId });
  for (const projectId of body.projectIds || []) projectPickers.push({ projectId });
  const searchTerms = {
    projectPickers,
    searchUsers: body.userIds || [],
    period: {
      start: new Date(body.startDate),
      end: new Date(body.endDate),
    },
    taskDesc: body.taskDesc || '',
    tagColor: {
      green: body.tagColor?.green || false,
      yellow: body.tagColor?.yellow || false,
      red: body.tagColor?.red || false,
      grey: body.tagColor?.grey || false,
      clear: body.tagColor?.clear || false,
    },
    tagText: body.tagText || '',
  };
  if (body.teamId) searchTerms.teamId = body.teamId;
  if (body.plan) searchTerms.plan = body.plan;
  const result = await timesheetExplorerOverlaps(user, searchTerms);
  res.json(result);
}));

WebApp.handlers.post('/api/composer/full', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'composerFull');
  if (!user) return;
  const body = req.body;
  if (!body.startDate) throw new Meteor.Error('400', 'startDate is required');
  if (!body.endDate) throw new Meteor.Error('400', 'endDate is required');
  const projectPickers = [];
  for (const clientId of body.clientIds || []) projectPickers.push({ clientId });
  for (const projectId of body.projectIds || []) projectPickers.push({ projectId });
  const searchTerms = {
    projectPickers,
    searchUsers: body.userIds || [],
    period: {
      start: new Date(body.startDate),
      end: new Date(body.endDate),
    },
    taskDesc: body.taskDesc || '',
    tagColor: {
      green: body.tagColor?.green || false,
      yellow: body.tagColor?.yellow || false,
      red: body.tagColor?.red || false,
      grey: body.tagColor?.grey || false,
      clear: body.tagColor?.clear || false,
    },
    tagText: body.tagText || '',
    sort: {
      first: body.sort?.first || 'date',
      second: body.sort?.second || 'none',
      third: body.sort?.third || 'none',
    },
  };
  if (body.limit) searchTerms.limit = body.limit;
  const result = await composerFull(user, searchTerms);
  res.json(result);
}));

WebApp.handlers.put('/api/composer/tag-color/update', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'composerTagColor');
  if (!user) return;
  await composerTagColor(user, req.body.selTimes, req.body.color);
  res.json({ ok: true });
}));

WebApp.handlers.put('/api/composer/tag-text/update', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'composerTagText');
  if (!user) return;
  await composerTagText(user, req.body.selTimes, req.body.text);
  res.json({ ok: true });
}));

WebApp.handlers.post('/api/composer/export', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'composerExporter');
  if (!user) return;
  const result = await composerExporter(user, req.body);
  res.json(result);
}));
