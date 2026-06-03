/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import loadTeams from '/src/server/core/loadTeams.js';
import saveTeams from '/src/server/core/saveTeams.js';

WebApp.handlers.get('/api/admin/teams', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'loadTeams');
  if (!user) return;
  const result = await loadTeams(user);
  res.json(result);
}));

WebApp.handlers.put('/api/admin/teams', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'saveTeams');
  if (!user) return;
  const result = await saveTeams(user, req.body.teams);
  res.json(result);
}));
