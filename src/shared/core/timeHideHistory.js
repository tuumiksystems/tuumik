/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Times } from '/src/shared/collections/collections.js';

const inputSchema = z.object({
  timeId: z.string(),
  hideHistory: z.boolean(),
});

export default async function timeHideHistory(user, timeId, hideHistory) {
  const parsed = inputSchema.safeParse({ timeId, hideHistory });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const query = { _id: timeId, owner: user._id };
  if (Meteor.isServer) query.tenantId = user.tenantId;
  if (hideHistory) {
    await Times.updateAsync(query, { $set: { hideHistory, lastModified: new Date() } });
  } else {
    await Times.updateAsync(query, { $unset: { hideHistory: '' }, $set: { lastModified: new Date() } });
  }
}
