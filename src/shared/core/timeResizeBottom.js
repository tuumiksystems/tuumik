/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Times } from '/src/shared/collections/collections.js';

const inputSchema = z.object({
  timeId: z.string(),
  endMinute: z.number().int().min(1, 'Incorrect end minute').max(1440, 'Incorrect end minute'),
});

export default async function timeResizeBottom(user, timeId, endMinute) {
  const parsed = inputSchema.safeParse({ timeId, endMinute });
  if (!parsed.success) throw new Meteor.Error('403', parsed.error.issues[0].message);

  const query = { _id: timeId, owner: user._id };
  if (Meteor.isServer) query.tenantId = user.tenantId;
  await Times.updateAsync(query, { $set: { endMinute, lastModified: new Date() } });
}
