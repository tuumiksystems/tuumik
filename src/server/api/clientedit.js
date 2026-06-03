/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import clientSave from '/src/server/core/clientSave.js';
import clientDeleteFn from '/src/server/core/clientDelete.js';

WebApp.handlers.put('/api/clients/:clientId', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'clientSave');
  if (!user) return;
  await clientSave(user, { ...req.body, _id: req.params.clientId });
  res.json({ ok: true });
}));

WebApp.handlers.delete('/api/clients/:clientId', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'clientDelete');
  if (!user) return;
  await clientDeleteFn(user, req.params.clientId);
  res.json({ ok: true });
}));
