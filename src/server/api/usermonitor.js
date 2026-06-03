/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import userMonitorLoad from '/src/server/core/userMonitorLoad.js';

WebApp.handlers.post('/api/monitor/user', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'userMonitorLoad');
  if (!user) return;
  const { userId } = req.body;
  const rawDates = req.body.dates;
  const dates = {
    startLocal: new Date(rawDates.startLocal),
    endLocal: new Date(rawDates.endLocal),
    startUTC: new Date(rawDates.startUTC),
    endUTC: new Date(rawDates.endUTC),
  };
  const result = await userMonitorLoad(user, dates, userId);
  res.json(result);
}));
