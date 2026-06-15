/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import timesheetExplorerFull from '/src/server/core/timesheetExplorerFull.js';
import timesheetExplorerTotals from '/src/server/core/timesheetExplorerTotals.js';
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
  const result = await timesheetExplorerFull(user, searchTerms);
  res.json(result);
}));

WebApp.handlers.post('/api/timesheet-explorer/totals', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'timesheetExplorerTotals');
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
  const result = await timesheetExplorerTotals(user, searchTerms);
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
