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
  const parsed = inputSchema.safeParse({ userId });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const targetUser = await Meteor.users.findOneAsync({ _id: userId });
  if (user.tenantId !== targetUser.tenantId) throw new Meteor.Error('403', 'Incorrect tenant');

  const timesExist = await Times.findOneAsync({ tenantId: user.tenantId, owner: userId });
  if (timesExist) throw new Meteor.Error('403', 'Cannot delete user since it has existing timesheet entries');

  await Meteor.users.removeAsync({ tenantId: user.tenantId, _id: userId });
}
