/* Copyright (C) 2026 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';

export default async function getAiSettingsSelf(user) {
  const editedUser = await Meteor.users.findOneAsync(
    { _id: user._id },
    {
      fields: {
        aiInstructions: 1,
      },
    },
  );

  if (!editedUser) throw new Meteor.Error('404', 'User not found');

  return { aiInstructions: editedUser.aiInstructions || '' };
}
