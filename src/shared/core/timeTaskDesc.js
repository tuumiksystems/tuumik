/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Times } from '/src/shared/collections/collections.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

const inputSchema = z.object({
  timeId: z.string(),
  taskDesc: z.string().max(500, 'Task description length limit exceeded'),
});

export default async function timeTaskDesc(user, timeId, taskDesc) {
  const parsed = inputSchema.safeParse({ timeId, taskDesc });
  if (!parsed.success) throw new Meteor.Error('403', parsed.error.issues[0].message);

  const query = { _id: timeId, owner: user._id };
  await Times.updateAsync(query, { $set: { taskDesc, taskDescNormalized: normalizeStringForAC(taskDesc), modifiedAt: new Date(), modifiedBy: { id: user._id, name: user.name } } });
}
