/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Times } from '/src/shared/collections/collections.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

export default async function timeTaskDesc(user, timeId, taskDesc) {
  if (taskDesc.length > 500) throw new Meteor.Error('403', 'Task description length limit exceeded');

  const query = { _id: timeId, owner: user._id };
  if (Meteor.isServer) query.tenantId = user.tenantId;
  await Times.updateAsync(query, { $set: { taskDesc, taskDescNormalized: normalizeStringForAC(taskDesc), lastModified: new Date() } });
}
