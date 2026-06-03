/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import insertTenantAndUser from '/src/server/core/insertTenantAndUser.js';
import resendEmailVerificationLink from '/src/server/core/resendEmailVerificationLink.js';
import sendEmailResetLink from '/src/server/core/sendEmailResetLink.js';
import loadSignupSettings from '/src/server/core/loadSignupSettings.js';

WebApp.handlers.get('/api/signup/settings', apiHandler(async (req, res) => {
  const result = await loadSignupSettings();
  res.json(result);
}));

WebApp.handlers.post('/api/signup', apiHandler(async (req, res) => {
  await insertTenantAndUser(req.body);
  res.json({ ok: true });
}));

WebApp.handlers.post('/api/signup/resend-verification', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'resendEmailVerificationLink');
  if (!user) return;
  await resendEmailVerificationLink(user._id);
  res.json({ ok: true });
}));

WebApp.handlers.post('/api/signup/reset-password', apiHandler(async (req, res) => {
  await sendEmailResetLink(req.body.email);
  res.json({ ok: true });
}));
