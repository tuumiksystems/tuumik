/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { apiHandler } from './auth.js';
import createDemo from '/src/server/core/createDemo.js';

WebApp.handlers.post('/api/demo', apiHandler(async (req, res) => {
  const email = await createDemo();
  res.json({ email });
}));
