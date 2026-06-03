/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Tenants, Statuses } from '/src/shared/collections/collections.js';

export default async function setInOutStatusSelf(user, status) {
  if (!user.permissions.inOutSelf) throw new Meteor.Error('403', 'No permission to edit in/out');

  const tenant = await Tenants.findOneAsync(user.tenantId);
  const { inOutOptions } = tenant;

  if (!inOutOptions.find(inOutOption => inOutOption.id === status)) throw new Meteor.Error('400', 'Unrecognized in/out status');

  const dateNow = new Date();

  await Meteor.users.updateAsync(
    { _id: user._id },
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
    userId: user._id,
    status: user.inOutStatus,
    start: user.inOutUpdateAt,
    end: dateNow,
  });
}
