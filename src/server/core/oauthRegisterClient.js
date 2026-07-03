/* Copyright (C) 2026 Tuumik Systems OÜ */

import crypto from 'node:crypto';
import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { OauthClients } from '/src/shared/collections/collections.js';
import { isAllowedRedirectUri } from './oauthUtils.js';

// RFC 7591 dynamic client registration for public clients (PKCE, no secret).
// Errors use reason = OAuth error code and details = description, which the
// HTTP endpoint translates into spec-format error bodies.

const inputSchema = z.object({
  redirectUris: z.array(z.string().max(2000)).min(1).max(10),
  clientName: z.string().max(100),
});

export default async function oauthRegisterClient(body) {
  const clientName = typeof body.client_name === 'string' && body.client_name.trim() ? body.client_name.trim() : 'Unnamed client';
  const redirectUris = body.redirect_uris;
  const parsed = inputSchema.safeParse({ redirectUris, clientName });
  if (!parsed.success) throw new Meteor.Error('400', 'invalid_client_metadata', parsed.error.issues[0].message);
  for (const uri of redirectUris) {
    if (!isAllowedRedirectUri(uri)) throw new Meteor.Error('400', 'invalid_redirect_uri', `Redirect URI not allowed: ${uri}`);
  }

  const clientResponse = (client) => ({
    client_id: client.clientId,
    client_id_issued_at: Math.floor(client.created.getTime() / 1000),
    client_name: client.clientName,
    redirect_uris: client.redirectUris,
    token_endpoint_auth_method: 'none',
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
  });

  // same client registering again gets its existing registration back
  const existing = await OauthClients.findOneAsync({ clientName, redirectUris });
  if (existing) return clientResponse(existing);

  const clientCount = await OauthClients.find().countAsync();
  if (clientCount > 199) throw new Meteor.Error('400', 'invalid_client_metadata', 'Registered client limit reached');

  // generate client id that is unique across all clients
  let clientId;
  do {
    clientId = crypto.randomBytes(16).toString('hex');
  } while (await OauthClients.findOneAsync({ clientId }));

  const newClient = { clientId, clientName, redirectUris, created: new Date() };
  await OauthClients.insertAsync(newClient);
  return clientResponse(newClient);
}
