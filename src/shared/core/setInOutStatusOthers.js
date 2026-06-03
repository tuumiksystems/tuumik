/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Tenants, Statuses } from '/src/shared/collections/collections.js';

export default async function setInOutStatusOthers(user, targetUserId, status) {
  if (user._id !== targetUserId && !user.permissions.inOutEditOthers) throw new Meteor.Error('403', 'No permission to edit in/out');

  const targetUser = await Meteor.users.findOneAsync(targetUserId);
  if (!targetUser) throw new Meteor.Error('404', 'Target user not found');

  const tenant = await Tenants.findOneAsync(user.tenantId);
  const { inOutOptions } = tenant;

  if (!inOutOptions.find(inOutOption => inOutOption.id === status)) throw new Meteor.Error('400', 'Unrecognized in/out status');

  const dateNow = new Date();

  await Meteor.users.updateAsync(
    { tenantId: user.tenantId, _id: targetUserId },
    {
      $set: {
        inOutStatus: status,
        inOutUpdateById: user._id,
        inOutUpdateByName: user.name,
        inOutUpdateAt: dateNow,
      },
    },
  );

  await Statuses.insertAsync({
    tenantId: user.tenantId,
    userId: targetUser._id,
    status: targetUser.inOutStatus,
    start: targetUser.inOutUpdateAt,
    end: dateNow,
  });
}
