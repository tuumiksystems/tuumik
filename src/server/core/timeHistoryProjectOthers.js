/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Times } from '/src/shared/collections/collections.js';

export default async function timeHistoryProjectOthers(user, projectId, limit) {
  if (!user.permissions.historyOthers) throw new Meteor.Error('100', 'No permission to view task history of other users');
  if (limit > 200) throw new Meteor.Error('100', 'Query limit exceeded');

  const timesRes = await Times.find(
    {
      tenantId: user.tenantId,
      owner: { $ne: user._id },
      projectId,
      hideHistory: { $ne: true },
    },
    {
      fields: {
        date: 1,
        owner: 1,
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

  // join owners
  const ownerIds = [...new Set(timesRes.map(time => time.owner))].sort();
  const ownersRes = await Meteor.users.find({ tenantId: user.tenantId, _id: { $in: ownerIds } }, { fields: { name: 1 } }).fetchAsync();
  const timesWithOwnersJoined = timesRes.map(time => {
    const x = time;
    const ownerDoc = ownersRes.find(owner => owner._id === time.owner);
    if (ownerDoc?.name) x.ownerName = ownerDoc.name;
    return x;
  });
  // /join owners

  return timesWithOwnersJoined;
}
