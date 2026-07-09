/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import dailyWorkSummary from '/src/server/core/dailyWorkSummary.js';

WebApp.handlers.post('/api/daily-work-summary', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'dailyWorkSummary');
  if (!user) return;
  const body = req.body;
  if (!body.startDay) throw new Meteor.Error('400', 'startDay is required');
  if (!body.endDay) throw new Meteor.Error('400', 'endDay is required');
  const args = {
    userIds: body.userIds,
    teamId: body.teamId,
    allUsers: body.allUsers,
    startDay: body.startDay,
    endDay: body.endDay,
    activeAfterMinute: body.activeAfterMinute,
    activeBeforeMinute: body.activeBeforeMinute,
    daysOfWeek: body.daysOfWeek,
    maxTotalMinutes: body.maxTotalMinutes,
    minTotalMinutes: body.minTotalMinutes,
    overlapMinutes: body.overlapMinutes,
    rollup: body.rollup,
  };
  const result = await dailyWorkSummary(user, args);
  res.json(result);
}));
