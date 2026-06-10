/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import clientInsert from '/src/server/core/clientInsert.js';
import clientHistory from '/src/server/core/clientHistory.js';

WebApp.handlers.post('/api/clients/insert', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'clientInsert');
  if (!user) return;
  const id = await clientInsert(user, req.body.name);
  res.status(201).json({ _id: id });
}));

WebApp.handlers.get('/api/clients/history', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'clientHistory');
  if (!user) return;
  const result = await clientHistory(user);
  res.json(result);
}));
