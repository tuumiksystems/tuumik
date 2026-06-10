/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import adminLoadExporters from '/src/server/core/adminLoadExporters.js';
import adminSaveExporters from '/src/server/core/adminSaveExporters.js';

WebApp.handlers.get('/api/admin/exporters', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'loadExporters');
  if (!user) return;
  const result = await adminLoadExporters(user);
  res.json(result);
}));

WebApp.handlers.put('/api/admin/exporters/update', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'saveExporters');
  if (!user) return;
  const result = await adminSaveExporters(user, req.body.exporters);
  res.json(result);
}));
