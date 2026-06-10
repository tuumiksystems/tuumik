/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { TaskGroups, Projects } from '/src/shared/collections/collections.js';
import adminLoadTaskGroups from '/src/server/core/adminLoadTaskGroups.js';

const inputSchema = z.object({
  taskGroupId: z.string(),
});

export default async function adminDeleteTaskGroup(user, taskGroupId) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access task groups');
  const parsed = inputSchema.safeParse({ taskGroupId });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const projectsExist = await Projects.findOneAsync({ tenantId: user.tenantId, taskGroupIds: taskGroupId });
  if (projectsExist) throw new Meteor.Error('403', 'Cannot delete task group since it is used in existing projects');

  await TaskGroups.removeAsync({ tenantId: user.tenantId, _id: taskGroupId });

  return adminLoadTaskGroups(user);
}
