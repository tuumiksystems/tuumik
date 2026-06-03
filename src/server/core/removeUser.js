/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Times } from '/src/shared/collections/collections.js';

export default async function removeUser(user, userId) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to edit users');
  if (user._id === userId) throw new Meteor.Error('403', 'User cannot delete itself');

  const targetUser = await Meteor.users.findOneAsync({ _id: userId });
  if (user.tenantId !== targetUser.tenantId) throw new Meteor.Error('403', 'Incorrect tenant');

  const timesExist = await Times.findOneAsync({ tenantId: user.tenantId, owner: userId });
  if (timesExist) throw new Meteor.Error('403', 'Cannot delete user since it has existing timesheet entries');

  await Meteor.users.removeAsync({ tenantId: user.tenantId, _id: userId });
}
