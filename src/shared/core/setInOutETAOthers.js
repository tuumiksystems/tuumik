/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';

export default async function setInOutETAOthers(user, targetUserId, note) {
  if (user._id !== targetUserId && !user.permissions.inOutEditOthers) throw new Meteor.Error('403', 'No permission to edit in/out');

  await Meteor.users.updateAsync(
    { tenantId: user.tenantId, _id: targetUserId },
    {
      $set: {
        inOutETA: note,
        inOutUpdateById: user._id,
        inOutUpdateByName: user.name,
        inOutUpdateAt: new Date(),
      },
    },
  );
}
