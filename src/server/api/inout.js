/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import setInOutStatusSelf from '/src/shared/core/setInOutStatusSelf.js';
import setInOutStatusOthers from '/src/shared/core/setInOutStatusOthers.js';
import setInOutNoteSelf from '/src/shared/core/setInOutNoteSelf.js';
import setInOutNoteOthers from '/src/shared/core/setInOutNoteOthers.js';
import setInOutETASelf from '/src/shared/core/setInOutETASelf.js';
import setInOutETAOthers from '/src/shared/core/setInOutETAOthers.js';

WebApp.handlers.patch('/api/inout/self/status', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'setInOutStatusSelf');
  if (!user) return;
  await setInOutStatusSelf(user, req.body.status);
  res.json({ ok: true });
}));

WebApp.handlers.patch('/api/inout/self/note', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'setInOutNoteSelf');
  if (!user) return;
  await setInOutNoteSelf(user, req.body.note);
  res.json({ ok: true });
}));

WebApp.handlers.patch('/api/inout/self/eta', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'setInOutETASelf');
  if (!user) return;
  await setInOutETASelf(user, req.body.eta);
  res.json({ ok: true });
}));

WebApp.handlers.patch('/api/inout/:userId/status', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'setInOutStatusOthers');
  if (!user) return;
  await setInOutStatusOthers(user, req.params.userId, req.body.status);
  res.json({ ok: true });
}));

WebApp.handlers.patch('/api/inout/:userId/note', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'setInOutNoteOthers');
  if (!user) return;
  await setInOutNoteOthers(user, req.params.userId, req.body.note);
  res.json({ ok: true });
}));

WebApp.handlers.patch('/api/inout/:userId/eta', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'setInOutETAOthers');
  if (!user) return;
  await setInOutETAOthers(user, req.params.userId, req.body.eta);
  res.json({ ok: true });
}));
