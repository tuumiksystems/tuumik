/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import adminLoadTeams from '/src/server/core/adminLoadTeams.js';
import adminSaveTeams from '/src/server/core/adminSaveTeams.js';

WebApp.handlers.get('/api/admin/teams', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'loadTeams');
  if (!user) return;
  const result = await adminLoadTeams(user);
  res.json(result);
}));

WebApp.handlers.put('/api/admin/teams/update', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'saveTeams');
  if (!user) return;
  const result = await adminSaveTeams(user, req.body.teams);
  res.json(result);
}));
