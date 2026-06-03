/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import getUserAndTenantSelf from '/src/server/core/getUserAndTenantSelf.js';

WebApp.handlers.get('/api/general/load-user-and-tenant-self', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'getUserAndTenantSelf');
  if (!user) return;
  const result = await getUserAndTenantSelf(user);
  res.json(result);
}));
