/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { TaskGroups, Projects } from '/src/shared/collections/collections.js';
import loadTaskGroups from '/src/server/core/loadTaskGroups.js';

export default async function deleteTaskGroup(user, taskGroupId) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access task groups');

  const projectsExist = await Projects.findOneAsync({ tenantId: user.tenantId, taskGroupIds: taskGroupId });
  if (projectsExist) throw new Meteor.Error('403', 'Cannot delete task group since it is used in existing projects');

  await TaskGroups.removeAsync({ tenantId: user.tenantId, _id: taskGroupId });

  return loadTaskGroups(user);
}
