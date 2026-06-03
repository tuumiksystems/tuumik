/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';

export default async function getUserForEditSelf(user) {
  const editedUser = await Meteor.users.findOneAsync(
    { _id: user._id },
    {
      fields: {
        apiKeyCreation: 1,
        apiKeys: 1,
      },
    },
  );

  if (!editedUser) throw new Meteor.Error('404', 'User not found');

  for (const apiKey of editedUser.apiKeys || []) {
    apiKey.hash = undefined;
  }

  return { editedUser };
}
