/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import loadRecentTimes from '/src/server/core/loadRecentTimes.js';

WebApp.handlers.get('/api/times/recent', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'loadRecentTimes');
  if (!user) return;
  const cutoff = req.query.cutoff || '10days';
  const result = await loadRecentTimes(user, cutoff);
  res.json(result);
}));
