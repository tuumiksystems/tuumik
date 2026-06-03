/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Times } from '/src/shared/collections/collections.js';

export default async function timeSetDate(user, timeId, selDate) {
  if (selDate.getUTCHours() !== 0 || selDate.getUTCMinutes() !== 0 || selDate.getUTCSeconds() !== 0 || selDate.getUTCMilliseconds() !== 1) {
    throw new Meteor.Error('403', 'Incorrect date format');
  }

  await Times.updateAsync(
    { tenantId: user.tenantId, _id: timeId, owner: user._id },
    { $set: { date: selDate, lastModified: new Date() } },
  );
}
