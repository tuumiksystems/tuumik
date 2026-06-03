/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Times } from '/src/shared/collections/collections.js';

export default async function timeHideHistory(user, timeId, hideHistory) {
  const query = { _id: timeId, owner: user._id };
  if (Meteor.isServer) query.tenantId = user.tenantId;
  if (hideHistory) {
    await Times.updateAsync(query, { $set: { hideHistory, lastModified: new Date() } });
  } else {
    await Times.updateAsync(query, { $unset: { hideHistory: '' }, $set: { lastModified: new Date() } });
  }
}
