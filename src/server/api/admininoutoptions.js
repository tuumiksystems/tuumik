/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import loadInOutOptions from '/src/server/core/loadInOutOptions.js';
import saveInOutOptions from '/src/server/core/saveInOutOptions.js';

WebApp.handlers.get('/api/admin/inout-options', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'loadInOutOptions');
  if (!user) return;
  const result = await loadInOutOptions(user);
  res.json(result);
}));

WebApp.handlers.put('/api/admin/inout-options', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'saveInOutOptions');
  if (!user) return;
  const result = await saveInOutOptions(user, req.body.inOutOptions);
  res.json(result);
}));
