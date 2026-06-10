/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import adminMainSettingsLoad from '/src/server/core/adminMainSettingsLoad.js';
import adminMainSettingsSave from '/src/server/core/adminMainSettingsSave.js';

WebApp.handlers.get('/api/admin/settings', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'mainSettingsLoad');
  if (!user) return;
  const result = await adminMainSettingsLoad(user);
  res.json(result);
}));

WebApp.handlers.put('/api/admin/settings/update', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'mainSettingsSave');
  if (!user) return;
  await adminMainSettingsSave(user, req.body);
  res.json({ ok: true });
}));
