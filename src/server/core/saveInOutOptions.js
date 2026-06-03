/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Tenants } from '/src/shared/collections/collections.js';
import loadInOutOptions from '/src/server/core/loadInOutOptions.js';

export default async function saveInOutOptions(user, inOutOptions) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');

  const tenant = await Tenants.findOneAsync(user.tenantId);
  let idCounter = Number.parseInt(tenant.inOutOptionsIdCounter, 10) || 10;
  const optionsProcessed = inOutOptions.map(opt => {
    if (opt.id) return { ...opt };
    idCounter += 1;
    return { ...opt, id: String(idCounter) };
  });
  await Tenants.updateAsync(
    { _id: user.tenantId },
    { $set: { inOutOptions: optionsProcessed, inOutOptionsIdCounter: idCounter } },
  );

  return loadInOutOptions(user);
}
