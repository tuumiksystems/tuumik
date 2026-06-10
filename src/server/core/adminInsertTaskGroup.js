/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { TaskGroups } from '/src/shared/collections/collections.js';
import adminLoadTaskGroups from '/src/server/core/adminLoadTaskGroups.js';

const inputSchema = z.object({
  name: z.string(),
});

export default async function adminInsertTaskGroup(user, name) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');
  const parsed = inputSchema.safeParse({ name });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const lastPos = await TaskGroups.findOneAsync({ tenantId: user.tenantId }, { fields: { position: 1 }, sort: { position: -1 } });
  const position = lastPos ? lastPos.position + 1 : 1;

  await TaskGroups.insertAsync({
    tenantId: user.tenantId,
    name,
    position,
    showByDefault: false,
    types: [],
  });

  return adminLoadTaskGroups(user);
}
