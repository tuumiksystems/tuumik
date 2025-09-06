/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Projects, Clients, TaskGroups, Times } from '/src/shared/collections/collections.js';

Meteor.methods({
  async getProjectForView(projectId) {
    check(projectId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);

    const projectRes = await Projects.findOneAsync(
      { tenantId: user.tenantId, _id: projectId },
      {
        fields: {
          name: 1,
          clientId: 1,
          taskGroupIds: 1,
          useTaskTypes: 1,
          reminder: 1,
          created: 1,
          lastModified: 1,
        },
      },
    );

    if (!projectRes) throw new Meteor.Error('404', 'Specified project not found');
    const clientRes = await Clients.findOneAsync({ tenantId: user.tenantId, _id: projectRes.clientId }, { fields: { name: 1 } });
    if (!clientRes) throw new Meteor.Error('500', 'Client for project not found');
    const taskGroupsRes = await TaskGroups.find({ tenantId: user.tenantId }, { fields: { name: 1, default: 1, types: 1 }, sort: { position: 1 } }).fetchAsync();

    return {
      project: projectRes,
      client: clientRes,
      taskGroups: taskGroupsRes,
    };
  },
  async getTimesForProjectView(projectId) {
    check(projectId, String);

    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user.permissions.composer) throw new Meteor.Error('403', 'No permission to access tasks');

    const limit = 20;
    const query = {
      tenantId: user.tenantId,
      projectId,
    };

    if (!user.permissions.historyOthers) query.owner = user._id;
    if (!user.permissions.composer) query.hideHistory = { $ne: true };

    const timesRes = await Times.find(query, {
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
    }).fetchAsync();

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
  },
});
