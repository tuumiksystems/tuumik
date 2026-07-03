/* Copyright (C) 2026 Tuumik Systems OÜ */

import crypto from 'node:crypto';
import { Meteor } from 'meteor/meteor';
import { OauthClients, OauthGrants } from '/src/shared/collections/collections.js';

// OAuth scopes map 1:1 to the API roles in /src/server/api/roles.js
export const scopeForRole = {
  regularReadOnly: 'read',
  regularReadWrite: 'write',
  admin: 'admin',
};

export const roleForScope = {
  read: 'regularReadOnly',
  write: 'regularReadWrite',
  admin: 'admin',
};

// Same opaque "<id>-<secret>" + SHA-256 hash structure as manual API keys,
// so tokens can be parsed and verified the same way in auth.js.
export function generateToken() {
  const id = crypto.randomBytes(8).toString('hex');
  const secret = crypto.randomBytes(20).toString('hex');
  const token = `${id}-${secret}`;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return { id, token, tokenHash };
}

export function verifyToken(token, tokenHash) {
  const candidateHash = crypto.createHash('sha256').update(token).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(candidateHash, 'hex'), Buffer.from(tokenHash, 'hex'));
}

function isLoopbackHost(hostname) {
  return ['localhost', '127.0.0.1', '[::1]', '::1'].includes(hostname);
}

export function isAllowedRedirectUri(uri) {
  let url;
  try {
    url = new URL(uri);
  } catch {
    return false;
  }
  if (url.protocol === 'https:') return true;
  // plain http only on loopback interfaces (RFC 8252)
  if (url.protocol === 'http:') return isLoopbackHost(url.hostname);
  // custom app schemes (vscode://, cursor://, ...); the code is useless without the PKCE verifier
  return true;
}

export function redirectUriMatches(registeredUri, requestedUri) {
  if (registeredUri === requestedUri) return true;
  // RFC 8252 §7.3: loopback redirects may use a different port than registered
  let a;
  let b;
  try {
    a = new URL(registeredUri);
    b = new URL(requestedUri);
  } catch {
    return false;
  }
  if (a.protocol !== 'http:' || b.protocol !== 'http:') return false;
  if (!isLoopbackHost(a.hostname) || !isLoopbackHost(b.hostname)) return false;
  return a.hostname === b.hostname && a.pathname === b.pathname;
}

// resolves an OAuth access token to its grant and user, or null if the token
// is invalid, expired, or belongs to a missing/disabled user
export async function resolveAccessToken(token) {
  const [id] = token.split('-');
  const grant = id ? await OauthGrants.findOneAsync({ accessTokenId: id }) : null;
  if (!grant || !verifyToken(token, grant.accessTokenHash)) return null;
  if (grant.accessTokenExpires < new Date()) return null;
  const user = await Meteor.users.findOneAsync({ _id: grant.userId });
  if (!user || user.disabled) return null;
  OauthGrants.updateAsync({ _id: grant._id }, { $set: { lastUsed: new Date() } }).catch(() => {});
  return { grant, user };
}

export async function getClientForRedirect(clientId, redirectUri) {
  const client = await OauthClients.findOneAsync({ clientId });
  if (!client) throw new Meteor.Error('404', 'Unknown OAuth client');
  if (!client.redirectUris.some((uri) => redirectUriMatches(uri, redirectUri))) {
    throw new Meteor.Error('400', 'Redirect URI does not match any registered redirect URI');
  }
  return client;
}
