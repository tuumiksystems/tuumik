/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { z } from 'zod';

const inputSchema = z.object({
  userId: z.string(),
});

export default async function adminSaveUserPassword(user, userId, password) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to edit users');
  const parsed = inputSchema.safeParse({ userId });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const targetUser = await Meteor.users.findOneAsync({ _id: userId });
  if (user.tenantId !== targetUser.tenantId) throw new Meteor.Error('403', 'Incorrect tenant');

  await Accounts.setPasswordAsync(userId, password, { logout: true });
}
