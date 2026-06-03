/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import mainSettingsLoad from '/src/server/core/mainSettingsLoad.js';
import mainSettingsSave from '/src/server/core/mainSettingsSave.js';

WebApp.handlers.get('/api/admin/settings', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'mainSettingsLoad');
  if (!user) return;
  const result = await mainSettingsLoad(user);
  res.json(result);
}));

WebApp.handlers.put('/api/admin/settings', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'mainSettingsSave');
  if (!user) return;
  await mainSettingsSave(user, req.body);
  res.json({ ok: true });
}));
