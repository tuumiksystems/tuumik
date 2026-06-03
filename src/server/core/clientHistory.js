/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Clients } from '/src/shared/collections/collections.js';

export default async function clientHistory(user) {
  if (!user.permissions.clientsEdit) throw new Meteor.Error('403', 'No permission to add clients');

  const res = await Clients.find(
    { tenantId: user.tenantId },
    {
      fields: { name: 1, created: 1 },
      sort: { created: -1 },
      limit: 10,
    },
  ).fetchAsync();

  return res;
}
