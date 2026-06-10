/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { TaskGroups } from '/src/shared/collections/collections.js';
import adminLoadTaskGroupForEdit from '/src/server/core/adminLoadTaskGroupForEdit.js';

const inputSchema = z.object({
  _id: z.string(),
  name: z.string(),
  position: z.number(),
  showByDefault: z.boolean(),
  types: z.array(z.unknown()),
});

export default async function adminSaveTaskGroup(user, taskGroup) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');
  const parsed = inputSchema.safeParse(taskGroup);
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const { name, position, showByDefault, types } = taskGroup;
  await TaskGroups.updateAsync({ tenantId: user.tenantId, _id: taskGroup._id }, { $set: { name, position, showByDefault, types } });

  return adminLoadTaskGroupForEdit(user, taskGroup._id);
}
