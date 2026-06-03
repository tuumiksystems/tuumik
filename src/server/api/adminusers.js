/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import usersList from '/src/server/core/usersList.js';
import getUserForEdit from '/src/server/core/getUserForEdit.js';
import addUser from '/src/server/core/addUser.js';
import saveUserGeneral from '/src/server/core/saveUserGeneral.js';
import saveUserUsername from '/src/server/core/saveUserUsername.js';
import saveUserPassword from '/src/server/core/saveUserPassword.js';
import addUserEmail from '/src/server/core/addUserEmail.js';
import removeUserEmail from '/src/server/core/removeUserEmail.js';
import sendVerifyEmail from '/src/server/core/sendVerifyEmail.js';
import removeUser from '/src/server/core/removeUser.js';
import disableUser from '/src/server/core/disableUser.js';
import enableUser from '/src/server/core/enableUser.js';

WebApp.handlers.get('/api/admin/users', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'usersList');
  if (!user) return;
  const result = await usersList(user);
  res.json(result);
}));

WebApp.handlers.post('/api/admin/users', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'addUser');
  if (!user) return;
  const id = await addUser(user, req.body.name, req.body.email, req.body.password);
  res.status(201).json({ _id: id });
}));

WebApp.handlers.get('/api/admin/users/:userId', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'getUserForEdit');
  if (!user) return;
  const result = await getUserForEdit(user, req.params.userId);
  res.json(result);
}));

WebApp.handlers.put('/api/admin/users/:userId', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'saveUserGeneral');
  if (!user) return;
  await saveUserGeneral(user, { ...req.body, _id: req.params.userId });
  res.json({ ok: true });
}));

WebApp.handlers.put('/api/admin/users/:userId/username', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'saveUserUsername');
  if (!user) return;
  await saveUserUsername(user, req.params.userId, req.body.username);
  res.json({ ok: true });
}));

WebApp.handlers.put('/api/admin/users/:userId/password', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'saveUserPassword');
  if (!user) return;
  await saveUserPassword(user, req.params.userId, req.body.password);
  res.json({ ok: true });
}));

WebApp.handlers.post('/api/admin/users/:userId/emails', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'addUserEmail');
  if (!user) return;
  await addUserEmail(user, req.params.userId, req.body.email);
  res.json({ ok: true });
}));

WebApp.handlers.delete('/api/admin/users/:userId/emails', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'removeUserEmail');
  if (!user) return;
  await removeUserEmail(user, req.params.userId, req.body.email);
  res.json({ ok: true });
}));

WebApp.handlers.post('/api/admin/users/:userId/verify-email', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'sendVerifyEmail');
  if (!user) return;
  await sendVerifyEmail(user, req.params.userId, req.body.email);
  res.json({ ok: true });
}));

WebApp.handlers.delete('/api/admin/users/:userId', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'removeUser');
  if (!user) return;
  await removeUser(user, req.params.userId);
  res.json({ ok: true });
}));

WebApp.handlers.put('/api/admin/users/:userId/disable', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'disableUser');
  if (!user) return;
  await disableUser(user, req.params.userId);
  res.json({ ok: true });
}));

WebApp.handlers.put('/api/admin/users/:userId/enable', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'enableUser');
  if (!user) return;
  await enableUser(user, req.params.userId);
  res.json({ ok: true });
}));
