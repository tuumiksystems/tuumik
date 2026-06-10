/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Times } from '/src/shared/collections/collections.js';

const inputSchema = z.object({
  timeId: z.string(),
  projectId: z.string(),
  limit: z.number().int().max(200, 'Query limit exceeded'),
});

export default async function timeHistoryProjectSelf(user, timeId, projectId, limit) {
  const parsed = inputSchema.safeParse({ timeId, projectId, limit });
  if (!parsed.success) throw new Meteor.Error('100', parsed.error.issues[0].message);

  const timesRes = await Times.find(
    {
      tenantId: user.tenantId,
      owner: user._id,
      projectId,
      hideHistory: { $ne: true },
      _id: { $ne: timeId },
    },
    {
      fields: {
        date: 1,
        startMinute: 1,
        endMinute: 1,
        taskType: 1,
        taskDesc: 1,
        useTaskType: 1,
        lastModified: 1,
      },
      sort: { date: -1, lastModified: -1 },
      limit,
    },
  ).fetchAsync();

  return timesRes;
}
