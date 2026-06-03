/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import getTaskGroups from '/src/server/core/getTaskGroups.js';

WebApp.handlers.get('/api/task-groups', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'getTaskGroups');
  if (!user) return;
  const result = await getTaskGroups(user);
  res.json(result);
}));
