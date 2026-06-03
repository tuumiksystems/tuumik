/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Times } from '/src/shared/collections/collections.js';

export default async function timeMove(user, timeId, startMinute) {
  if (startMinute < 0 || startMinute > 1440 || !Number.isInteger(startMinute)) throw new Meteor.Error('403', 'Incorrect start minute');

  const currentTime = await Times.findOneAsync({ _id: timeId, owner: user._id });
  const endMinute = startMinute + currentTime.endMinute - currentTime.startMinute;

  const query = { _id: timeId, owner: user._id };
  if (Meteor.isServer) query.tenantId = user.tenantId;
  await Times.updateAsync(query, { $set: { startMinute, endMinute, lastModified: new Date() } });
}
