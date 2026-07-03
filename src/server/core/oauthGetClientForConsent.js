/* Copyright (C) 2026 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { getClientForRedirect } from './oauthUtils.js';

const inputSchema = z.object({
  clientId: z.string(),
  redirectUri: z.string(),
});

export default async function oauthGetClientForConsent(clientId, redirectUri) {
  const parsed = inputSchema.safeParse({ clientId, redirectUri });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const client = await getClientForRedirect(clientId, redirectUri);
  return { clientName: client.clientName };
}
