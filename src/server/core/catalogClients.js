/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Clients } from '/src/shared/collections/collections.js';

export default async function catalogClients(user) {
  if (!user.permissions.catalog) throw new Meteor.Error('403', 'No permission to access catalog');

  const res = await Clients.find({ tenantId: user.tenantId }, { fields: { name: 1 }, sort: { name: 1 } }).fetchAsync();

  return res;
}
