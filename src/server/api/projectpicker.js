/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import pickClientInProjectPicker from '/src/server/core/pickClientInProjectPicker.js';
import pickProjectInProjectPicker from '/src/server/core/pickProjectInProjectPicker.js';

WebApp.handlers.get('/api/project-picker/client/:clientId', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'pickClientInProjectPicker');
  if (!user) return;
  const result = await pickClientInProjectPicker(user, req.params.clientId);
  res.json(result);
}));

WebApp.handlers.get('/api/project-picker/project/:projectId', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'pickProjectInProjectPicker');
  if (!user) return;
  const result = await pickProjectInProjectPicker(user, req.params.projectId);
  res.json(result);
}));
