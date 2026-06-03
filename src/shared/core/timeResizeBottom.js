/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Times } from '/src/shared/collections/collections.js';

export default async function timeResizeBottom(user, timeId, endMinute) {
  if (endMinute < 1 || endMinute > 1440 || !Number.isInteger(endMinute)) throw new Meteor.Error('403', 'Incorrect end minute');

  const query = { _id: timeId, owner: user._id };
  if (Meteor.isServer) query.tenantId = user.tenantId;
  await Times.updateAsync(query, { $set: { endMinute, lastModified: new Date() } });
}
