/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Projects } from '/src/shared/collections/collections.js';

export default async function catalogProjectsForClient(user, clientId) {
  if (!user.permissions.catalog) throw new Meteor.Error('403', 'No permission to access catalog');

  const res = await Projects.find(
    { tenantId: user.tenantId, clientId },
    { fields: { name: 1, created: 1 }, sort: { created: 1 } },
  ).fetchAsync();

  return res;
}
