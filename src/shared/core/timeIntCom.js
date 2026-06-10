/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Times } from '/src/shared/collections/collections.js';

const inputSchema = z.object({
  timeId: z.string(),
  intCom: z.string().max(500, 'Internal comment length limit exceeded'),
});

export default async function timeIntCom(user, timeId, intCom) {
  const parsed = inputSchema.safeParse({ timeId, intCom });
  if (!parsed.success) throw new Meteor.Error('403', parsed.error.issues[0].message);

  const query = { _id: timeId, owner: user._id };
  if (Meteor.isServer) query.tenantId = user.tenantId;
  await Times.updateAsync(query, { $set: { intCom, lastModified: new Date() } });
}
