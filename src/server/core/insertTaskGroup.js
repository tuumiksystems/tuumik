/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { TaskGroups } from '/src/shared/collections/collections.js';
import loadTaskGroups from '/src/server/core/loadTaskGroups.js';

export default async function insertTaskGroup(user, name) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');

  const lastPos = await TaskGroups.findOneAsync({ tenantId: user.tenantId }, { fields: { position: 1 }, sort: { position: -1 } });
  const position = lastPos ? lastPos.position + 1 : 1;

  await TaskGroups.insertAsync({
    tenantId: user.tenantId,
    name,
    position,
    showByDefault: false,
    types: [],
  });

  return loadTaskGroups(user);
}
