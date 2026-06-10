/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import adminLoadInOutOptions from '/src/server/core/adminLoadInOutOptions.js';
import adminSaveInOutOptions from '/src/server/core/adminSaveInOutOptions.js';

WebApp.handlers.get('/api/admin/inout-options', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'loadInOutOptions');
  if (!user) return;
  const result = await adminLoadInOutOptions(user);
  res.json(result);
}));

WebApp.handlers.put('/api/admin/inout-options/update', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'saveInOutOptions');
  if (!user) return;
  const result = await adminSaveInOutOptions(user, req.body.inOutOptions);
  res.json(result);
}));
