/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import loadExporters from '/src/server/core/loadExporters.js';
import saveExporters from '/src/server/core/saveExporters.js';

WebApp.handlers.get('/api/admin/exporters', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'loadExporters');
  if (!user) return;
  const result = await loadExporters(user);
  res.json(result);
}));

WebApp.handlers.put('/api/admin/exporters', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'saveExporters');
  if (!user) return;
  const result = await saveExporters(user, req.body.exporters);
  res.json(result);
}));
