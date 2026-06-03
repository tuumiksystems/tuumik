/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Clients } from '/src/shared/collections/collections.js';
import clientAdd from '/src/server/integrations/client-add.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

export default async function clientInsert(user, name) {
  if (!user.permissions.clientsEdit) throw new Meteor.Error('403', 'No permission to add clients');
  if (name.length < 2) throw new Meteor.Error('405', 'Client name must be at least 2 characters');

  const doc = {
    tenantId: user.tenantId,
    name,
    nameNormalized: normalizeStringForAC(name),
    reminder: '',
    created: new Date(),
    lastModified: new Date(),
  };

  const id = await Clients.insertAsync(doc);
  clientAdd({ name });
  return id;
}
