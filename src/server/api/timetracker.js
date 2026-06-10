/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import timeHistoryClearSelf from '/src/server/core/timeHistoryClearSelf.js';
import timeHistoryProjectSelf from '/src/server/core/timeHistoryProjectSelf.js';
import timeHistoryProjectOthers from '/src/server/core/timeHistoryProjectOthers.js';
import timeHistoryClientSelf from '/src/server/core/timeHistoryClientSelf.js';
import timeHistoryClientOthers from '/src/server/core/timeHistoryClientOthers.js';
import timeHistorySearch from '/src/server/core/timeHistorySearch.js';
import timeSetDate from '/src/server/core/timeSetDate.js';

WebApp.handlers.get('/api/times/history/self', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'timeHistoryClearSelf');
  if (!user) return;
  const excludeTimeId = req.query.excludeTimeId || '';
  const limit = Math.min(Number.parseInt(req.query.limit) || 50, 200);
  const result = await timeHistoryClearSelf(user, excludeTimeId, limit);
  res.json(result);
}));

WebApp.handlers.get('/api/times/history/project/:projectId/self', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'timeHistoryProjectSelf');
  if (!user) return;
  const excludeTimeId = req.query.excludeTimeId || '';
  const limit = Math.min(Number.parseInt(req.query.limit) || 50, 200);
  const result = await timeHistoryProjectSelf(user, excludeTimeId, req.params.projectId, limit);
  res.json(result);
}));

WebApp.handlers.get('/api/times/history/project/:projectId/others', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'timeHistoryProjectOthers');
  if (!user) return;
  const limit = Math.min(Number.parseInt(req.query.limit) || 50, 200);
  const result = await timeHistoryProjectOthers(user, req.params.projectId, limit);
  res.json(result);
}));

WebApp.handlers.get('/api/times/history/client/:clientId/self', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'timeHistoryClientSelf');
  if (!user) return;
  const excludeTimeId = req.query.excludeTimeId || '';
  const limit = Math.min(Number.parseInt(req.query.limit) || 50, 200);
  const result = await timeHistoryClientSelf(user, excludeTimeId, req.params.clientId, limit);
  res.json(result);
}));

WebApp.handlers.get('/api/times/history/client/:clientId/others', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'timeHistoryClientOthers');
  if (!user) return;
  const limit = Math.min(Number.parseInt(req.query.limit) || 50, 200);
  const result = await timeHistoryClientOthers(user, req.params.clientId, limit);
  res.json(result);
}));

WebApp.handlers.post('/api/times/history/search', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'timeHistorySearch');
  if (!user) return;
  const { taskDesc, owner, scope, projectId, clientId, sort, limit } = req.body;
  const result = await timeHistorySearch(user, taskDesc, owner, scope, projectId, clientId, sort, Math.min(limit || 50, 200));
  res.json(result);
}));

WebApp.handlers.patch('/api/times/:timeId/date/set', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'timeSetDate');
  if (!user) return;
  const selDate = new Date(`${req.body.date}T00:00:00.001Z`);
  await timeSetDate(user, req.params.timeId, selDate);
  res.json({ ok: true });
}));
