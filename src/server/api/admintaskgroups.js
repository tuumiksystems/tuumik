/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import loadTaskGroups from '/src/server/core/loadTaskGroups.js';
import loadTaskGroupForEdit from '/src/server/core/loadTaskGroupForEdit.js';
import insertTaskGroup from '/src/server/core/insertTaskGroup.js';
import saveTaskGroup from '/src/server/core/saveTaskGroup.js';
import deleteTaskGroup from '/src/server/core/deleteTaskGroup.js';

WebApp.handlers.get('/api/admin/task-groups', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'loadTaskGroups');
  if (!user) return;
  const result = await loadTaskGroups(user);
  res.json(result);
}));

WebApp.handlers.post('/api/admin/task-groups', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'insertTaskGroup');
  if (!user) return;
  const result = await insertTaskGroup(user, req.body.name);
  res.status(201).json(result);
}));

WebApp.handlers.get('/api/admin/task-groups/:taskGroupId', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'loadTaskGroupForEdit');
  if (!user) return;
  const result = await loadTaskGroupForEdit(user, req.params.taskGroupId);
  res.json(result);
}));

WebApp.handlers.put('/api/admin/task-groups/:taskGroupId', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'saveTaskGroup');
  if (!user) return;
  const result = await saveTaskGroup(user, { ...req.body, _id: req.params.taskGroupId });
  res.json(result);
}));

WebApp.handlers.delete('/api/admin/task-groups/:taskGroupId', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'deleteTaskGroup');
  if (!user) return;
  const result = await deleteTaskGroup(user, req.params.taskGroupId);
  res.json(result);
}));
