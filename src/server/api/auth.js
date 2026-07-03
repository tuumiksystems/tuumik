/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import crypto from 'node:crypto';
import bodyParser from 'body-parser';
import { Meteor } from 'meteor/meteor';
import { resolveAccessToken } from '/src/server/core/oauthUtils.js';
import { roles } from './roles.js';

const parseJsonBody = (req, res) =>
  new Promise((resolve, reject) => {
    bodyParser.json()(req, res, (err) => (err ? reject(err) : resolve()));
  });

// accepts either an OAuth access token (Authorization: Bearer) or a manual
// API key (x-api-key); both resolve to a user and a role from roles.js
export async function authorizeApiRequest(req, res, permission) {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const apiKey = req.headers['x-api-key'];

  let user;
  let roleId;

  if (bearerToken) {
    const resolved = await resolveAccessToken(bearerToken);
    if (!resolved) {
      res.status(401).json({ error: 'Invalid or expired access token' });
      return null;
    }
    user = resolved.user;
    roleId = resolved.grant.role;
  } else if (apiKey) {
    const [id, secret] = apiKey.split('-');
    if (!id || !secret) {
      res.status(401).json({ error: 'Incorrect x-api-key header structure' });
      return null;
    }

    user = await Meteor.users.findOneAsync({ 'apiKeys.id': id });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return null;
    }

    const apiKeyRecord = user.apiKeys.find((k) => k.id === id);

    const candidateHash = crypto.createHash('sha256').update(apiKey).digest('hex');
    const valid = crypto.timingSafeEqual(Buffer.from(candidateHash, 'hex'), Buffer.from(apiKeyRecord.tokenHash, 'hex'));
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return null;
    }

    if (apiKeyRecord.expires && apiKeyRecord.expires < new Date()) {
      res.status(401).json({ error: 'API key expired' });
      return null;
    }

    if (user.disabled) {
      res.status(401).json({ error: 'User disabled' });
      return null;
    }

    roleId = apiKeyRecord.role;
  } else {
    res.status(401).json({ error: 'Missing credentials, provide an Authorization Bearer token or an x-api-key header' });
    return null;
  }

  const role = roles.find((r) => r.id === roleId);
  if (!role || !role.allowed.includes(permission)) {
    res.status(403).json({ error: 'Forbidden' });
    return null;
  }

  return user;
}

export function apiHandler(fn) {
  return async (req, res) => {
    try {
      if (!req.body) await parseJsonBody(req, res);
      await fn(req, res);
    } catch (err) {
      res.status(Number.parseInt(err.error) || 500).json({ error: err.reason || err.message });
    }
  };
}
