/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { TaskGroups } from '/src/shared/collections/collections.js';

export default async function loadTaskGroups(user) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');

  const res = await TaskGroups.find(
    { tenantId: user.tenantId },
    {
      fields: { name: 1, position: 1, showByDefault: 1, types: 1 },
      sort: { position: 1 },
    },
  ).fetchAsync();

  return res;
}
