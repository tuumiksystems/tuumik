/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Times } from '/src/shared/collections/collections.js';

const inputSchema = z.object({
  selTimes: z.array(z.string()),
  color: z.string(),
});

export default async function composerTagColor(user, selTimes, color) {
  if (!user.permissions.composer) throw new Meteor.Error('403', 'No permission to access composer');
  const parsed = inputSchema.safeParse({ selTimes, color });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  await Times.updateAsync({ tenantId: user.tenantId, _id: { $in: selTimes } }, { $set: { tagColor: color, lastModified: new Date() } }, { multi: true });
}
