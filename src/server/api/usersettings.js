/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import getApiKeysSelf from '/src/server/core/getApiKeysSelf.js';
import createApiKeySelf from '/src/server/core/createApiKeySelf.js';
import removeApiKeySelf from '/src/server/core/removeApiKeySelf.js';

WebApp.handlers.get('/api/users/load-api-keys-self', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'getApiKeysSelf');
  if (!user) return;
  const result = await getApiKeysSelf(user);
  res.json(result);
}));

WebApp.handlers.post('/api/users/create-api-key-self', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'createApiKeySelf');
  if (!user) return;
  const result = await createApiKeySelf(user, req.body.role, req.body.desc);
  res.json(result);
}));

WebApp.handlers.delete('/api/users/remove-api-key-self', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'removeApiKeySelf');
  if (!user) return;
  const result = await removeApiKeySelf(user, req.body.apiKeyId);
  res.json(result);
}));
