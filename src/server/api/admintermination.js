/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import terminateTenant from '/src/server/core/terminateTenant.js';

WebApp.handlers.delete('/api/admin/tenant', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'terminateTenant');
  if (!user) return;
  await terminateTenant(user, req.body.password);
  res.json({ ok: true });
}));
