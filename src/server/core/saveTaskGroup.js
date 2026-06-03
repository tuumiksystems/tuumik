/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { TaskGroups } from '/src/shared/collections/collections.js';
import loadTaskGroupForEdit from '/src/server/core/loadTaskGroupForEdit.js';

export default async function saveTaskGroup(user, taskGroup) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');

  const { name, position, showByDefault, types } = taskGroup;
  await TaskGroups.updateAsync({ tenantId: user.tenantId, _id: taskGroup._id }, { $set: { name, position, showByDefault, types } });

  return loadTaskGroupForEdit(user, taskGroup._id);
}
