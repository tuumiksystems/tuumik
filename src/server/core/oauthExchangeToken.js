/* Copyright (C) 2026 Tuumik Systems OÜ */

import crypto from 'node:crypto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Meteor } from 'meteor/meteor';
import { OauthClients, OauthCodes, OauthGrants } from '/src/shared/collections/collections.js';
import { generateToken, verifyToken } from './oauthUtils.js';

dayjs.extend(utc);

// Errors use reason = OAuth error code and details = description, which the
// HTTP endpoint translates into spec-format error bodies (RFC 6749 §5.2).
const oauthError = (code, description) => new Meteor.Error('400', code, description);

function accessTokenMinutes() {
  const minutes = Number(process.env.OAUTH_ACCESS_TOKEN_EXPIRY_MINUTES);
  return Number.isInteger(minutes) && minutes > 0 ? minutes : 60;
}

function refreshTokenDays() {
  const days = Number(process.env.OAUTH_REFRESH_TOKEN_EXPIRY_DAYS);
  return Number.isInteger(days) && days > 0 ? days : 90;
}

function issueTokens() {
  const accessToken = generateToken();
  const refreshToken = generateToken();
  return {
    accessToken,
    refreshToken,
    fields: {
      accessTokenId: accessToken.id,
      accessTokenHash: accessToken.tokenHash,
      accessTokenExpires: dayjs.utc().add(accessTokenMinutes(), 'minutes').toDate(),
      refreshTokenId: refreshToken.id,
      refreshTokenHash: refreshToken.tokenHash,
      refreshTokenExpires: dayjs.utc().add(refreshTokenDays(), 'days').toDate(),
    },
  };
}

function tokenResponse(accessToken, refreshToken, scope) {
  return {
    access_token: accessToken.token,
    token_type: 'Bearer',
    expires_in: accessTokenMinutes() * 60,
    refresh_token: refreshToken.token,
    scope,
  };
}

async function exchangeCode(body) {
  const { code, code_verifier: codeVerifier, client_id: clientId, redirect_uri: redirectUri } = body;
  if (typeof code !== 'string' || typeof codeVerifier !== 'string' || typeof clientId !== 'string' || typeof redirectUri !== 'string') {
    throw oauthError('invalid_request', 'Missing code, code_verifier, client_id or redirect_uri');
  }

  const [codeId] = code.split('-');
  const codeDoc = codeId ? await OauthCodes.findOneAsync({ codeId }) : null;
  if (!codeDoc || !verifyToken(code, codeDoc.codeHash)) throw oauthError('invalid_grant', 'Invalid authorization code');
  // single-use: burn the code before any further checks
  await OauthCodes.removeAsync({ _id: codeDoc._id });

  if (codeDoc.expires < new Date()) throw oauthError('invalid_grant', 'Authorization code expired');
  if (codeDoc.clientId !== clientId) throw oauthError('invalid_grant', 'Client mismatch');
  if (codeDoc.redirectUri !== redirectUri) throw oauthError('invalid_grant', 'Redirect URI mismatch');

  const challenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  if (challenge !== codeDoc.codeChallenge) throw oauthError('invalid_grant', 'PKCE verification failed');

  const user = await Meteor.users.findOneAsync({ _id: codeDoc.userId });
  if (!user || user.disabled) throw oauthError('invalid_grant', 'User not available');
  const client = await OauthClients.findOneAsync({ clientId });
  if (!client) throw oauthError('invalid_grant', 'Unknown OAuth client');

  const { accessToken, refreshToken, fields } = issueTokens();
  await OauthGrants.insertAsync({
    userId: user._id,
    clientId,
    clientName: client.clientName,
    role: codeDoc.role,
    scope: codeDoc.scope,
    ...fields,
    created: new Date(),
    lastUsed: new Date(),
  });
  await OauthClients.updateAsync({ _id: client._id }, { $set: { lastUsed: new Date() } });

  return tokenResponse(accessToken, refreshToken, codeDoc.scope);
}

async function refreshGrant(body) {
  const { refresh_token: refreshTokenValue, client_id: clientId } = body;
  if (typeof refreshTokenValue !== 'string' || typeof clientId !== 'string') {
    throw oauthError('invalid_request', 'Missing refresh_token or client_id');
  }

  const [refreshTokenId] = refreshTokenValue.split('-');
  const grant = refreshTokenId ? await OauthGrants.findOneAsync({ refreshTokenId }) : null;
  if (!grant || !verifyToken(refreshTokenValue, grant.refreshTokenHash)) throw oauthError('invalid_grant', 'Invalid refresh token');
  if (grant.clientId !== clientId) throw oauthError('invalid_grant', 'Client mismatch');
  if (grant.refreshTokenExpires < new Date()) {
    await OauthGrants.removeAsync({ _id: grant._id });
    throw oauthError('invalid_grant', 'Refresh token expired');
  }

  const user = await Meteor.users.findOneAsync({ _id: grant.userId });
  if (!user || user.disabled) {
    await OauthGrants.removeAsync({ _id: grant._id });
    throw oauthError('invalid_grant', 'User not available');
  }

  // rotation: every refresh replaces both tokens and invalidates the old refresh token
  const { accessToken, refreshToken, fields } = issueTokens();
  await OauthGrants.updateAsync({ _id: grant._id }, { $set: { ...fields, lastUsed: new Date() } });

  return tokenResponse(accessToken, refreshToken, grant.scope);
}

export default async function oauthExchangeToken(body) {
  if (!body || typeof body !== 'object') throw oauthError('invalid_request', 'Missing request body');
  if (body.grant_type === 'authorization_code') return exchangeCode(body);
  if (body.grant_type === 'refresh_token') return refreshGrant(body);
  throw oauthError('unsupported_grant_type', 'Supported grant types: authorization_code, refresh_token');
}
