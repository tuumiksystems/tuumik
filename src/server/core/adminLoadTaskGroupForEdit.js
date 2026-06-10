/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { TaskGroups } from '/src/shared/collections/collections.js';

const inputSchema = z.object({
  taskGroupId: z.string(),
});

export default async function adminLoadTaskGroupForEdit(user, taskGroupId) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');
  const parsed = inputSchema.safeParse({ taskGroupId });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const res = await TaskGroups.findOneAsync(
    { tenantId: user.tenantId, _id: taskGroupId },
    { fields: { name: 1, position: 1, showByDefault: 1, types: 1 } },
  );
  if (!res) throw new Meteor.Error('404', 'Task group not found');

  return res;
}
