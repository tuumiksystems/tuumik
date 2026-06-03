/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';

export default async function removeApiKeySelf(user, apiKeyId) {
  await Meteor.users.updateAsync({ _id: user._id }, { $pull: { apiKeys: { id: apiKeyId } } });
}
