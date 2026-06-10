/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Statuses } from '/src/shared/collections/collections.js';

const inputSchema = z.object({
  userIds: z.array(z.string()).min(1),
  startLocal: z.date(),
  endLocal: z.date(),
});

export default async function loadInOutBoardHistory(user, args) {
  const { userIds, startLocal, endLocal } = args;
  if (!user.permissions.inOutView) throw new Meteor.Error('403', 'No permission to view in/out board');

  const normalizedIds = Array.isArray(userIds) ? userIds : [userIds];

  const parsed = inputSchema.safeParse({ userIds: normalizedIds, startLocal, endLocal });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  return Statuses.find(
    {
      tenantId: user.tenantId,
      $or: [
        { start: { $gt: startLocal, $lt: endLocal } },
        { end: { $gt: startLocal, $lt: endLocal } },
        { start: { $lt: startLocal }, end: { $gt: endLocal } },
      ],
      userId: { $in: normalizedIds },
    },
    {
      fields: {
        userId: 1,
        start: 1,
        end: 1,
        status: 1,
        note: 1,
        eta: 1,
        updaters: 1,
      },
    },
  ).fetchAsync();
}
