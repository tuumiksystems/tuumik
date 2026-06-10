/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import adminUsersList from '/src/server/core/adminUsersList.js';
import adminGetUserForEdit from '/src/server/core/adminGetUserForEdit.js';
import adminAddUser from '/src/server/core/adminAddUser.js';
import adminSaveUserGeneral from '/src/server/core/adminSaveUserGeneral.js';
import adminSaveUserUsername from '/src/server/core/adminSaveUserUsername.js';
import adminSaveUserPassword from '/src/server/core/adminSaveUserPassword.js';
import adminAddUserEmail from '/src/server/core/adminAddUserEmail.js';
import adminRemoveUserEmail from '/src/server/core/adminRemoveUserEmail.js';
import adminSendVerifyEmail from '/src/server/core/adminSendVerifyEmail.js';
import adminRemoveUser from '/src/server/core/adminRemoveUser.js';
import adminDisableUser from '/src/server/core/adminDisableUser.js';
import adminEnableUser from '/src/server/core/adminEnableUser.js';

WebApp.handlers.get('/api/admin/users', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'usersList');
  if (!user) return;
  const result = await adminUsersList(user);
  res.json(result);
}));

WebApp.handlers.post('/api/admin/users', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'addUser');
  if (!user) return;
  const id = await adminAddUser(user, req.body.name, req.body.email, req.body.password);
  res.status(201).json({ _id: id });
}));

WebApp.handlers.get('/api/admin/users/:userId', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'getUserForEdit');
  if (!user) return;
  const result = await adminGetUserForEdit(user, req.params.userId);
  res.json(result);
}));

WebApp.handlers.put('/api/admin/users/:userId/update', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'saveUserGeneral');
  if (!user) return;
  await adminSaveUserGeneral(user, { ...req.body, _id: req.params.userId });
  res.json({ ok: true });
}));

WebApp.handlers.put('/api/admin/users/:userId/username/update', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'saveUserUsername');
  if (!user) return;
  await adminSaveUserUsername(user, req.params.userId, req.body.username);
  res.json({ ok: true });
}));

WebApp.handlers.put('/api/admin/users/:userId/password/update', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'saveUserPassword');
  if (!user) return;
  await adminSaveUserPassword(user, req.params.userId, req.body.password);
  res.json({ ok: true });
}));

WebApp.handlers.post('/api/admin/users/:userId/emails', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'addUserEmail');
  if (!user) return;
  await adminAddUserEmail(user, req.params.userId, req.body.email);
  res.json({ ok: true });
}));

WebApp.handlers.delete('/api/admin/users/:userId/emails/delete', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'removeUserEmail');
  if (!user) return;
  await adminRemoveUserEmail(user, req.params.userId, req.body.email);
  res.json({ ok: true });
}));

WebApp.handlers.post('/api/admin/users/:userId/verify-email', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'sendVerifyEmail');
  if (!user) return;
  await adminSendVerifyEmail(user, req.params.userId, req.body.email);
  res.json({ ok: true });
}));

WebApp.handlers.delete('/api/admin/users/:userId/delete', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'removeUser');
  if (!user) return;
  await adminRemoveUser(user, req.params.userId);
  res.json({ ok: true });
}));

WebApp.handlers.put('/api/admin/users/:userId/disable', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'disableUser');
  if (!user) return;
  await adminDisableUser(user, req.params.userId);
  res.json({ ok: true });
}));

WebApp.handlers.put('/api/admin/users/:userId/enable', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'enableUser');
  if (!user) return;
  await adminEnableUser(user, req.params.userId);
  res.json({ ok: true });
}));
