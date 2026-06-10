/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import projectInsert from '/src/server/core/projectInsert.js';
import projectHistory from '/src/server/core/projectHistory.js';

WebApp.handlers.post('/api/projects/insert', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'projectInsert');
  if (!user) return;
  const id = await projectInsert(user, req.body.name, req.body.clientId);
  res.status(201).json({ _id: id });
}));

WebApp.handlers.get('/api/projects/history', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'projectHistory');
  if (!user) return;
  const result = await projectHistory(user);
  res.json(result);
}));
