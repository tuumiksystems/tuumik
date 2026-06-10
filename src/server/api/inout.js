/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import loadInOutBoard from '/src/server/core/loadInOutBoard.js';
import loadInOutBoardHistory from '/src/server/core/loadInOutBoardHistory.js';
import setInOutSelf from '/src/shared/core/setInOutSelf.js';
import setInOutOthers from '/src/shared/core/setInOutOthers.js';

WebApp.handlers.get('/api/inout/board', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'loadInOutBoard');
  if (!user) return;
  const { searchedUserId = '', teamId = '' } = req.query;
  const args = { searchedUserId, teamId };
  const result = await loadInOutBoard(user, args);
  res.json(result);
}));

WebApp.handlers.post('/api/inout/board-history', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'loadInOutBoardHistory');
  if (!user) return;
  const { userIds, startLocal, endLocal } = req.body;
  const args = { userIds, startLocal: new Date(startLocal), endLocal: new Date(endLocal) };
  const result = await loadInOutBoardHistory(user, args);
  res.json(result);
}));

WebApp.handlers.patch('/api/inout/set/self', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'setInOutSelf');
  if (!user) return;
  await setInOutSelf(user, req.body.board);
  res.json({ ok: true });
}));

WebApp.handlers.patch('/api/inout/set/:userId', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'setInOutOthers');
  if (!user) return;
  await setInOutOthers(user, req.params.userId, req.body.board);
  res.json({ ok: true });
}));
