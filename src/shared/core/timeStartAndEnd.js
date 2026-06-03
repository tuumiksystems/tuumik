/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Times } from '/src/shared/collections/collections.js';

export default async function timeStartAndEnd(user, timeId, startMinute, endMinute) {
  if (startMinute < 0 || startMinute > 1440 || !Number.isInteger(startMinute)) throw new Meteor.Error('403', 'Incorrect start minute');
  if (endMinute < 1 || endMinute > 1440 || !Number.isInteger(endMinute)) throw new Meteor.Error('403', 'Incorrect end minute');
  if (endMinute < startMinute) throw new Meteor.Error('403', 'End must be after start');

  const query = { _id: timeId, owner: user._id };
  if (Meteor.isServer) query.tenantId = user.tenantId;
  await Times.updateAsync(query, { $set: { startMinute, endMinute, lastModified: new Date() } });
}
