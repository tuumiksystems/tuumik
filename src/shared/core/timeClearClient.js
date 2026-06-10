/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Times } from '/src/shared/collections/collections.js';

const inputSchema = z.object({
  timeId: z.string(),
});

export default async function timeClearClient(user, timeId) {
  const parsed = inputSchema.safeParse({ timeId });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const query = { _id: timeId, owner: user._id };
  if (Meteor.isServer) query.tenantId = user.tenantId;
  await Times.updateAsync(query, { $unset: { projectId: '', clientId: '' }, $set: { lastModified: new Date() } });
}
