/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import teamMonitorLoad from '/src/server/core/teamMonitorLoad.js';

WebApp.handlers.post('/api/monitor/team', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'teamMonitorLoad');
  if (!user) return;
  const { teamId, userId } = req.body;
  const rawDates = req.body.dates;
  const dates = {
    startLocal: new Date(rawDates.startLocal),
    endLocal: new Date(rawDates.endLocal),
    monitorDate: new Date(rawDates.monitorDate),
  };
  const result = await teamMonitorLoad(user, dates, teamId, userId);
  res.json(result);
}));
