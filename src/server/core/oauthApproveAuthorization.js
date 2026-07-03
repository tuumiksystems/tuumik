/* Copyright (C) 2026 Tuumik Systems OÜ */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { OauthCodes, OauthGrants } from '/src/shared/collections/collections.js';
import { generateToken, getClientForRedirect, scopeForRole } from './oauthUtils.js';

dayjs.extend(utc);

const inputSchema = z.object({
  clientId: z.string(),
  redirectUri: z.string(),
  codeChallenge: z.string().min(43).max(128),
  codeChallengeMethod: z.literal('S256'),
  role: z.enum(['regularReadOnly', 'regularReadWrite', 'admin']),
});

export default async function oauthApproveAuthorization(user, params) {
  if (!user.apiKeyCreation) throw new Meteor.Error('403', 'No permission to authorize apps');
  const parsed = inputSchema.safeParse(params);
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);
  const { clientId, redirectUri, codeChallenge, role } = parsed.data;

  await getClientForRedirect(clientId, redirectUri);

  const grantCount = await OauthGrants.find({ userId: user._id }).countAsync();
  if (grantCount > 19) throw new Meteor.Error('403', 'User cannot have more connected apps, limit reached');

  const { id, token, tokenHash } = generateToken();
  await OauthCodes.insertAsync({
    codeId: id,
    codeHash: tokenHash,
    userId: user._id,
    clientId,
    role,
    scope: scopeForRole[role],
    redirectUri,
    codeChallenge,
    expires: dayjs.utc().add(10, 'minutes').toDate(),
    created: new Date(),
  });

  return { code: token };
}
