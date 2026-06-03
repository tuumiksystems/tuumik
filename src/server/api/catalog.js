/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import catalogClients from '/src/server/core/catalogClients.js';
import catalogProjectsForClient from '/src/server/core/catalogProjectsForClient.js';

WebApp.handlers.get('/api/clients', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'catalogClients');
  if (!user) return;
  const result = await catalogClients(user);
  res.json(result);
}));

WebApp.handlers.get('/api/projects', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'catalogProjectsForClient');
  if (!user) return;
  const { clientId } = req.query;
  if (!clientId) { res.status(400).json({ error: 'clientId query param required' }); return; }
  const result = await catalogProjectsForClient(user, clientId);
  res.json(result);
}));
