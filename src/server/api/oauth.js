/* Copyright (C) 2026 Tuumik Systems OÜ */

import bodyParser from 'body-parser';
import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import oauthExchangeToken from '/src/server/core/oauthExchangeToken.js';
import oauthRegisterClient from '/src/server/core/oauthRegisterClient.js';
import { resolveAccessToken, verifyToken } from '/src/server/core/oauthUtils.js';
import { OauthGrants } from '/src/shared/collections/collections.js';

// OAuth 2.1 authorization server endpoints for MCP clients (RFC 8414 metadata,
// RFC 7591 dynamic registration, code + PKCE token exchange, RFC 7009 revocation).
// The authorization endpoint itself is the client-side route /oauth/authorize;
// consent is granted through Meteor methods (see /src/server/methods/oauth.js).

const jsonParser = bodyParser.json();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

// harnesses send token/register requests as JSON or form-encoded, accept both
const parseBody = (req, res) =>
  new Promise((resolve, reject) => {
    jsonParser(req, res, (jsonErr) => {
      if (jsonErr) return reject(jsonErr);
      urlencodedParser(req, res, (err) => (err ? reject(err) : resolve()));
    });
  });

// browser-based MCP clients fetch these endpoints cross-origin
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization, mcp-protocol-version');
  res.setHeader('Access-Control-Max-Age', '86400');
}

// unlike apiHandler, errors follow the OAuth format: Meteor.Error reason
// carries the error code and details the description (RFC 6749 §5.2)
const oauthHandler = (fn) => async (req, res) => {
  setCors(res);
  try {
    await fn(req, res);
  } catch (err) {
    const status = Number.parseInt(err.error) || 500;
    const body = { error: err.reason || err.message || 'server_error' };
    if (err.details) body.error_description = err.details;
    res.status(status).json(body);
  }
};

const rootUrl = () => Meteor.absoluteUrl().replace(/\/$/, '');

// registration is unauthenticated, so apply a simple in-memory rate limit
const registerHits = new Map();
function registerRateLimited(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = (typeof forwarded === 'string' && forwarded.split(',')[0].trim()) || req.socket.remoteAddress || 'unknown';
  if (registerHits.size > 1000) registerHits.clear();
  const now = Date.now();
  const hits = (registerHits.get(ip) || []).filter((t) => now - t < 60 * 60 * 1000);
  hits.push(now);
  registerHits.set(ip, hits);
  return hits.length > 20;
}

for (const path of ['/.well-known/oauth-authorization-server', '/oauth/register', '/oauth/token', '/oauth/revoke']) {
  WebApp.handlers.options(path, (req, res) => {
    setCors(res);
    res.status(204).end();
  });
}

WebApp.handlers.get(
  '/.well-known/oauth-authorization-server',
  oauthHandler(async (req, res) => {
    const root = rootUrl();
    res.json({
      issuer: root,
      authorization_endpoint: `${root}/oauth/authorize`,
      token_endpoint: `${root}/oauth/token`,
      registration_endpoint: `${root}/oauth/register`,
      revocation_endpoint: `${root}/oauth/revoke`,
      scopes_supported: ['read', 'write'],
      response_types_supported: ['code'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      token_endpoint_auth_methods_supported: ['none'],
      revocation_endpoint_auth_methods_supported: ['none'],
      code_challenge_methods_supported: ['S256'],
    });
  }),
);

WebApp.handlers.post(
  '/oauth/register',
  oauthHandler(async (req, res) => {
    if (registerRateLimited(req)) {
      res.status(429).json({ error: 'invalid_client_metadata', error_description: 'Too many registration requests' });
      return;
    }
    if (!req.body) await parseBody(req, res);
    const result = await oauthRegisterClient(req.body);
    res.status(201).json(result);
  }),
);

WebApp.handlers.post(
  '/oauth/token',
  oauthHandler(async (req, res) => {
    if (!req.body) await parseBody(req, res);
    const result = await oauthExchangeToken(req.body);
    res.json(result);
  }),
);

// RFC 7009: deleting the grant kills both tokens; always respond 200
WebApp.handlers.post(
  '/oauth/revoke',
  oauthHandler(async (req, res) => {
    if (!req.body) await parseBody(req, res);
    const token = req.body?.token;
    if (typeof token === 'string') {
      const [id] = token.split('-');
      const grant = id ? await OauthGrants.findOneAsync({ $or: [{ accessTokenId: id }, { refreshTokenId: id }] }) : null;
      if (grant) {
        const hash = grant.accessTokenId === id ? grant.accessTokenHash : grant.refreshTokenHash;
        if (verifyToken(token, hash)) await OauthGrants.removeAsync({ _id: grant._id });
      }
    }
    res.json({});
  }),
);

// used by the MCP server's requireBearerAuth verifier to validate tokens
// before JSON-RPC handling; role/permission checks stay on the real endpoints
WebApp.handlers.get(
  '/api/oauth/verify',
  oauthHandler(async (req, res) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const resolved = token ? await resolveAccessToken(token) : null;
    if (!resolved) {
      res.status(401).json({ error: 'invalid_token' });
      return;
    }
    const { grant } = resolved;
    res.json({
      userId: grant.userId,
      clientId: grant.clientId,
      scopes: [grant.scope],
      expiresAt: Math.floor(grant.accessTokenExpires.getTime() / 1000),
    });
  }),
);
