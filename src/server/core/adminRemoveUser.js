/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Times } from '/src/shared/collections/collections.js';

const inputSchema = z.object({
  userId: z.string(),
});

export default async function adminRemoveUser(user, userId) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to edit users');
  if (user._id === userId) throw new Meteor.Error('403', 'User cannot delete itself');
  if (Meteor.settings.public.demoPublic) throw new Meteor.Error('403', 'This feature is not enabled in this public demo');
  const parsed = inputSchema.safeParse({ userId });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const timesExist = await Times.findOneAsync({ owner: userId });
  if (timesExist) throw new Meteor.Error('403', 'Cannot delete user since it has existing timesheet entries');

  await Meteor.users.removeAsync({ _id: userId });
}
