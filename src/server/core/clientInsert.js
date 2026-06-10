/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Clients } from '/src/shared/collections/collections.js';
import clientAdd from '/src/server/integrations/client-add.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

const inputSchema = z.object({
  name: z.string().min(2, 'Client name must be at least 2 characters'),
});

export default async function clientInsert(user, name) {
  if (!user.permissions.clientsEdit) throw new Meteor.Error('403', 'No permission to add clients');
  const parsed = inputSchema.safeParse({ name });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

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
