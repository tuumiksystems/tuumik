/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import composerAll from '/src/server/core/composerAll.js';
import composerTagColor from '/src/server/core/composerTagColor.js';
import composerTagText from '/src/server/core/composerTagText.js';
import composerExporter from '/src/server/core/composerExporter.js';

WebApp.handlers.post('/api/explorer', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'composerAll');
  if (!user) return;
  const body = req.body;
  const projectPickers = [];
  for (const clientId of body.clientIds || []) projectPickers.push({ clientId });
  for (const projectId of body.projectIds || []) projectPickers.push({ projectId });
  const searchTerms = {
    projectPickers,
    searchUsers: body.userIds || [],
    period: {
      start: body.startDate ? new Date(body.startDate) : '',
      end: body.endDate ? new Date(body.endDate) : '',
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
  const result = await composerAll(user, searchTerms);
  res.json(result);
}));

WebApp.handlers.put('/api/explorer/tag-color', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'composerTagColor');
  if (!user) return;
  await composerTagColor(user, req.body.selTimes, req.body.color);
  res.json({ ok: true });
}));

WebApp.handlers.put('/api/explorer/tag-text', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'composerTagText');
  if (!user) return;
  await composerTagText(user, req.body.selTimes, req.body.text);
  res.json({ ok: true });
}));

WebApp.handlers.post('/api/explorer/export', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'composerExporter');
  if (!user) return;
  const result = await composerExporter(user, req.body);
  res.json(result);
}));
