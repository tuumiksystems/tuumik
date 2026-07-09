/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import loadInOutBoardCurrent from '/src/server/core/loadInOutBoardCurrent.js';
import loadInOutBoardHistoryFull from '/src/server/core/loadInOutBoardHistoryFull.js';
import loadInOutBoardHistoryTotals from '/src/server/core/loadInOutBoardHistoryTotals.js';
import loadInOutBoardHistoryConcurrency from '/src/server/core/loadInOutBoardHistoryConcurrency.js';
import setInOutSelf from '/src/shared/core/setInOutSelf.js';
import setInOutOthers from '/src/shared/core/setInOutOthers.js';

// Over HTTP (JSON) an ETA arrives as an ISO 8601 string; the core expects an
// absolute Date instant (or null to clear). Coerce at the boundary, mirroring
// how startLocal/endLocal are converted above.
function coerceBoardEta(board) {
  if (board && typeof board.eta === 'string') {
    const d = new Date(board.eta);
    if (Number.isNaN(d.getTime())) throw new Meteor.Error('400', 'eta must be a valid ISO 8601 timestamp or null');
    return { ...board, eta: d };
  }
  return board;
}

WebApp.handlers.get('/api/inout/board/current', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'loadInOutBoard');
  if (!user) return;
  const { searchedUserId = '', teamId = '' } = req.query;
  // over HTTP the flag arrives as a string; anything else is treated as absent
  const allUsers = req.query.allUsers === 'true' ? true : undefined;
  const args = { searchedUserId, teamId, allUsers };
  const result = await loadInOutBoardCurrent(user, args);
  res.json(result);
}));

WebApp.handlers.post('/api/inout/board-history/full', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'loadInOutBoardHistoryFull');
  if (!user) return;
  const { userIds, teamId, allUsers, startLocal, endLocal, skip, includeDetails } = req.body;
  if (!startLocal) throw new Meteor.Error('400', 'startLocal is required');
  if (!endLocal) throw new Meteor.Error('400', 'endLocal is required');
  const args = { userIds, teamId, allUsers, startLocal: new Date(startLocal), endLocal: new Date(endLocal), skip, includeDetails };
  const result = await loadInOutBoardHistoryFull(user, args);
  res.json(result);
}));

WebApp.handlers.post('/api/inout/board-history/totals', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'loadInOutBoardHistoryTotals');
  if (!user) return;
  const { userIds, teamId, allUsers, startLocal, endLocal, groupBy, bucketBy, daysOfWeek, overlapMinutes, statusIds, top, rankBy } = req.body;
  if (!startLocal) throw new Meteor.Error('400', 'startLocal is required');
  if (!endLocal) throw new Meteor.Error('400', 'endLocal is required');
  const args = { userIds, teamId, allUsers, startLocal: new Date(startLocal), endLocal: new Date(endLocal), groupBy, bucketBy, daysOfWeek, overlapMinutes, statusIds, top, rankBy };
  const result = await loadInOutBoardHistoryTotals(user, args);
  res.json(result);
}));

WebApp.handlers.post('/api/inout/board-history/concurrency', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'loadInOutBoardHistoryConcurrency');
  if (!user) return;
  const { userIds, teamId, allUsers, startLocal, endLocal, overlapMinutes } = req.body;
  if (!startLocal) throw new Meteor.Error('400', 'startLocal is required');
  if (!endLocal) throw new Meteor.Error('400', 'endLocal is required');
  const args = { userIds, teamId, allUsers, startLocal: new Date(startLocal), endLocal: new Date(endLocal), overlapMinutes };
  const result = await loadInOutBoardHistoryConcurrency(user, args);
  res.json(result);
}));

WebApp.handlers.patch('/api/inout/set/self', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'setInOutSelf');
  if (!user) return;
  await setInOutSelf(user, coerceBoardEta(req.body.board));
  res.json({ ok: true });
}));

WebApp.handlers.patch('/api/inout/set/:userId', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'setInOutOthers');
  if (!user) return;
  await setInOutOthers(user, req.params.userId, coerceBoardEta(req.body.board));
  res.json({ ok: true });
}));
