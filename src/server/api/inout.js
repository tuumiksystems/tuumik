/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import loadInOutBoardCurrent from '/src/server/core/loadInOutBoardCurrent.js';
import loadInOutBoardHistoryFull from '/src/server/core/loadInOutBoardHistoryFull.js';
import loadInOutBoardHistoryTotals from '/src/server/core/loadInOutBoardHistoryTotals.js';
import setInOutSelf from '/src/shared/core/setInOutSelf.js';
import setInOutOthers from '/src/shared/core/setInOutOthers.js';

WebApp.handlers.get('/api/inout/board/current', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'loadInOutBoard');
  if (!user) return;
  const { searchedUserId = '', teamId = '' } = req.query;
  const args = { searchedUserId, teamId };
  const result = await loadInOutBoardCurrent(user, args);
  res.json(result);
}));

WebApp.handlers.post('/api/inout/board-history/full', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'loadInOutBoardHistoryFull');
  if (!user) return;
  const { userIds, startLocal, endLocal } = req.body;
  if (!startLocal) throw new Meteor.Error('400', 'startLocal is required');
  if (!endLocal) throw new Meteor.Error('400', 'endLocal is required');
  const args = { userIds, startLocal: new Date(startLocal), endLocal: new Date(endLocal) };
  const result = await loadInOutBoardHistoryFull(user, args);
  res.json(result);
}));

WebApp.handlers.post('/api/inout/board-history/totals', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'loadInOutBoardHistoryTotals');
  if (!user) return;
  const { userIds, startLocal, endLocal } = req.body;
  if (!startLocal) throw new Meteor.Error('400', 'startLocal is required');
  if (!endLocal) throw new Meteor.Error('400', 'endLocal is required');
  const args = { userIds, startLocal: new Date(startLocal), endLocal: new Date(endLocal) };
  const result = await loadInOutBoardHistoryTotals(user, args);
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
