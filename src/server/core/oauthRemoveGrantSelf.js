/* Copyright (C) 2026 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { OauthGrants } from '/src/shared/collections/collections.js';

const inputSchema = z.object({
  grantId: z.string(),
});

export default async function oauthRemoveGrantSelf(user, grantId) {
  const parsed = inputSchema.safeParse({ grantId });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  await OauthGrants.removeAsync({ _id: grantId, userId: user._id });
}
