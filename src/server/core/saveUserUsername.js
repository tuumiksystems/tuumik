/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

export default async function saveUserUsername(user, userId, username) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to edit users');

  const targetUser = await Meteor.users.findOneAsync({ _id: userId });
  if (user.tenantId !== targetUser.tenantId) throw new Meteor.Error('403', 'Incorrect tenant');

  await Accounts.setUsername(userId, username);
}
