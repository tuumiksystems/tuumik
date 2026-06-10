/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import loadAllUsers from '/src/server/core/loadAllUsers.js';

WebApp.handlers.get('/api/users/load-all', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'loadAllUsers');
  if (!user) return;
  const result = await loadAllUsers(user);
  res.json(result);
}));
