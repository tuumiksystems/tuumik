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
  if (hideHistory) {
    await Times.updateAsync(query, { $set: { hideHistory, modifiedAt: new Date(), modifiedBy: { id: user._id, name: user.name } } });
  } else {
    await Times.updateAsync(query, { $unset: { hideHistory: '' }, $set: { modifiedAt: new Date(), modifiedBy: { id: user._id, name: user.name } } });
  }
}
