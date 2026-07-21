/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';

const inputSchema = z.object({
  userId: z.string(),
});

export default async function adminEnableUser(user, userId) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to edit users');
  if (Meteor.settings.public.demoPublic) throw new Meteor.Error('403', 'This feature is not enabled in this public demo');
  const parsed = inputSchema.safeParse({ userId });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  await Meteor.users.updateAsync({ _id: userId }, { $set: { disabled: false } });
}
