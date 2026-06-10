/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import adminLoadTaskGroups from '/src/server/core/adminLoadTaskGroups.js';
import adminLoadTaskGroupForEdit from '/src/server/core/adminLoadTaskGroupForEdit.js';
import adminInsertTaskGroup from '/src/server/core/adminInsertTaskGroup.js';
import adminSaveTaskGroup from '/src/server/core/adminSaveTaskGroup.js';
import adminDeleteTaskGroup from '/src/server/core/adminDeleteTaskGroup.js';

WebApp.handlers.get('/api/admin/task-groups', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'loadTaskGroups');
  if (!user) return;
  const result = await adminLoadTaskGroups(user);
  res.json(result);
}));

WebApp.handlers.post('/api/admin/task-groups', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'insertTaskGroup');
  if (!user) return;
  const result = await adminInsertTaskGroup(user, req.body.name);
  res.status(201).json(result);
}));

WebApp.handlers.get('/api/admin/task-groups/:taskGroupId', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'loadTaskGroupForEdit');
  if (!user) return;
  const result = await adminLoadTaskGroupForEdit(user, req.params.taskGroupId);
  res.json(result);
}));

WebApp.handlers.put('/api/admin/task-groups/:taskGroupId/update', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'saveTaskGroup');
  if (!user) return;
  const result = await adminSaveTaskGroup(user, { ...req.body, _id: req.params.taskGroupId });
  res.json(result);
}));

WebApp.handlers.delete('/api/admin/task-groups/:taskGroupId/delete', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'deleteTaskGroup');
  if (!user) return;
  const result = await adminDeleteTaskGroup(user, req.params.taskGroupId);
  res.json(result);
}));
