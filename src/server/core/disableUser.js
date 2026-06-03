/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

export default async function disableUser(user, userId) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to edit users');
  if (user._id === userId) throw new Meteor.Error('403', 'User cannot disable itself');

  const targetUser = await Meteor.users.findOneAsync({ _id: userId });
  if (user.tenantId !== targetUser.tenantId) throw new Meteor.Error('403', 'Incorrect tenant');

  const password = String(Math.floor(Math.random() * 100000000000));
  await Accounts.setPasswordAsync(userId, password, { logout: true });

  await Meteor.users.updateAsync({ tenantId: user.tenantId, _id: userId }, { $set: { disabled: true } });
}
