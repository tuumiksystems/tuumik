/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Tenants } from '/src/shared/collections/collections.js';
import adminLoadInOutOptions from '/src/server/core/adminLoadInOutOptions.js';

const inputSchema = z.array(
  z.object({ id: z.string().optional() }).passthrough(),
);

export default async function adminSaveInOutOptions(user, inOutOptions) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');
  const parsed = inputSchema.safeParse(inOutOptions);
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

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

  return adminLoadInOutOptions(user);
}
