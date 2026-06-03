/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import getProjectForView from '/src/server/core/getProjectForView.js';
import getTimesForProjectView from '/src/server/core/getTimesForProjectView.js';

WebApp.handlers.get('/api/projects/:projectId', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'getProjectForView');
  if (!user) return;
  const result = await getProjectForView(user, req.params.projectId);
  res.json(result);
}));

WebApp.handlers.get('/api/projects/:projectId/times', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'getTimesForProjectView');
  if (!user) return;
  const result = await getTimesForProjectView(user, req.params.projectId);
  res.json(result);
}));
