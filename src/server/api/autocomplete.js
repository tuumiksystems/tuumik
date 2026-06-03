/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import autocompleteClients from '/src/server/core/autocompleteClients.js';
import autocompleteProjects from '/src/server/core/autocompleteProjects.js';
import autocompleteUsers from '/src/server/core/autocompleteUsers.js';

WebApp.handlers.get('/api/autocomplete/clients', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'autocompleteClients');
  if (!user) return;
  const result = await autocompleteClients(user, req.query.q || '');
  res.json(result);
}));

WebApp.handlers.get('/api/autocomplete/projects', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'autocompleteProjects');
  if (!user) return;
  const result = await autocompleteProjects(user, req.query.q || '');
  res.json(result);
}));

WebApp.handlers.get('/api/autocomplete/users', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'autocompleteUsers');
  if (!user) return;
  const result = await autocompleteUsers(user, req.query.q || '');
  res.json(result);
}));
