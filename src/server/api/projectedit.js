/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import projectSave from '/src/server/core/projectSave.js';
import projectDeleteFn from '/src/server/core/projectDelete.js';

WebApp.handlers.put('/api/projects/:projectId', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'projectSave');
  if (!user) return;
  await projectSave(user, { ...req.body, _id: req.params.projectId });
  res.json({ ok: true });
}));

WebApp.handlers.delete('/api/projects/:projectId', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'projectDelete');
  if (!user) return;
  await projectDeleteFn(user, req.params.projectId);
  res.json({ ok: true });
}));
