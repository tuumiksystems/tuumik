/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import catalogClients from '/src/server/core/catalogClients.js';
import catalogProjects from '/src/server/core/catalogProjects.js';
import catalogCreationStats from '/src/server/core/catalogCreationStats.js';

WebApp.handlers.get('/api/clients', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'catalogClients');
  if (!user) return;
  const result = await catalogClients(user);
  res.json(result);
}));

WebApp.handlers.get('/api/projects', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'catalogProjects');
  if (!user) return;
  const { clientId } = req.query;
  const result = await catalogProjects(user, clientId);
  res.json(result);
}));

WebApp.handlers.post('/api/catalog/creation-stats', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'catalogCreationStats');
  if (!user) return;
  const { entity, createdAfter, createdBefore, includeRecords } = req.body;
  if (!entity) throw new Meteor.Error('400', 'entity is required');
  const args = { entity, includeRecords };
  // dates arrive as ISO strings over HTTP; the core expects Date instants
  if (createdAfter) args.createdAfter = new Date(createdAfter);
  if (createdBefore) args.createdBefore = new Date(createdBefore);
  const result = await catalogCreationStats(user, args);
  res.json(result);
}));
