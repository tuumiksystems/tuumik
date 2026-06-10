/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import adminTerminateTenant from '/src/server/core/adminTerminateTenant.js';

WebApp.handlers.delete('/api/admin/tenant/delete', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'terminateTenant');
  if (!user) return;
  await adminTerminateTenant(user, req.body.password);
  res.json({ ok: true });
}));
