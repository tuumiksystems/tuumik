/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';

export default async function setInOutNoteSelf(user, note) {
  if (!user.permissions.inOutSelf) throw new Meteor.Error('403', 'No permission to edit in/out');

  await Meteor.users.updateAsync(
    { _id: user._id },
    {
      $set: {
        inOutNote: note,
        inOutUpdateById: user._id,
        inOutUpdateByName: user.name,
        inOutUpdateAt: new Date(),
      },
    },
  );
}
