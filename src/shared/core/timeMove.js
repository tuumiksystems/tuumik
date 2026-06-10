/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Times } from '/src/shared/collections/collections.js';

const inputSchema = z.object({
  timeId: z.string(),
  startMinute: z.number().int().min(0, 'Incorrect start minute').max(1440, 'Incorrect start minute'),
});

export default async function timeMove(user, timeId, startMinute) {
  const parsed = inputSchema.safeParse({ timeId, startMinute });
  if (!parsed.success) throw new Meteor.Error('403', parsed.error.issues[0].message);

  const currentTime = await Times.findOneAsync({ _id: timeId, owner: user._id });
  const endMinute = startMinute + currentTime.endMinute - currentTime.startMinute;

  const query = { _id: timeId, owner: user._id };
  if (Meteor.isServer) query.tenantId = user.tenantId;
  await Times.updateAsync(query, { $set: { startMinute, endMinute, lastModified: new Date() } });
}
