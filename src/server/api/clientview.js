/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import getClientForView from '/src/server/core/getClientForView.js';
import getProjectsForClientView from '/src/server/core/getProjectsForClientView.js';
import getTimesForClientView from '/src/server/core/getTimesForClientView.js';

WebApp.handlers.get('/api/clients/:clientId', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'getClientForView');
  if (!user) return;
  const result = await getClientForView(user, req.params.clientId);
  res.json(result);
}));

WebApp.handlers.get('/api/clients/:clientId/projects', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'getProjectsForClientView');
  if (!user) return;
  const result = await getProjectsForClientView(user, req.params.clientId);
  res.json(result);
}));

WebApp.handlers.get('/api/clients/:clientId/times', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'getTimesForClientView');
  if (!user) return;
  const result = await getTimesForClientView(user, req.params.clientId);
  res.json(result);
}));
