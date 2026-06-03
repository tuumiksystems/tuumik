/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Times, Projects } from '/src/shared/collections/collections.js';

export default async function timeHistoryClientOthers(user, clientId, limit) {
  if (!user.permissions.historyOthers) throw new Meteor.Error('100', 'No permission to view task history of other users');
  if (limit > 200) throw new Meteor.Error('100', 'Query limit exceeded');

  const clientProjects = await Projects.find({ tenantId: user.tenantId, clientId }).fetchAsync();
  const allProjectIds = clientProjects.map(project => project._id);

  const timesRes = await Times.find(
    {
      tenantId: user.tenantId,
      owner: { $ne: user._id },
      projectId: { $in: allProjectIds },
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
        projectId: 1,
        useTaskType: 1,
        lastModified: 1,
      },
      sort: { date: -1, lastModified: -1 },
      limit,
    },
  ).fetchAsync();

  // join projects and owners
  const projectIds = [...new Set(timesRes.map(time => time.projectId))].sort();
  const projectsRes = await Projects.find({ tenantId: user.tenantId, _id: { $in: projectIds } }, { fields: { name: 1 } }).fetchAsync();
  const ownerIds = [...new Set(timesRes.map(time => time.owner))].sort();
  const ownersRes = await Meteor.users.find({ tenantId: user.tenantId, _id: { $in: ownerIds } }, { fields: { name: 1 } }).fetchAsync();
  const timesWithJoins = timesRes.map(time => {
    const x = time;
    const projectDoc = projectsRes.find(project => project._id === time.projectId);
    if (projectDoc?.name) x.projectName = projectDoc.name;
    const ownerDoc = ownersRes.find(owner => owner._id === time.owner);
    if (ownerDoc?.name) x.ownerName = ownerDoc.name;
    return x;
  });
  // /join projects and owners

  return timesWithJoins;
}
