/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Times } from '/src/shared/collections/collections.js';

export default async function timeHistoryProjectSelf(user, timeId, projectId, limit) {
  if (limit > 200) throw new Meteor.Error('100', 'Query limit exceeded');

  const timesRes = await Times.find(
    {
      tenantId: user.tenantId,
      owner: user._id,
      projectId,
      hideHistory: { $ne: true },
      _id: { $ne: timeId },
    },
    {
      fields: {
        date: 1,
        startMinute: 1,
        endMinute: 1,
        taskType: 1,
        taskDesc: 1,
        useTaskType: 1,
        lastModified: 1,
      },
      sort: { date: -1, lastModified: -1 },
      limit,
    },
  ).fetchAsync();

  return timesRes;
}
