/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';

const inputSchema = z.object({
  apiKeyId: z.string(),
});

export default async function removeApiKeySelf(user, apiKeyId) {
  const parsed = inputSchema.safeParse({ apiKeyId });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  await Meteor.users.updateAsync({ _id: user._id }, { $pull: { apiKeys: { id: apiKeyId } } });
}
