/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Clients, Projects } from '/src/shared/collections/collections.js';

const inputSchema = z.object({
  clientId: z.string(),
});

export default async function pickClientInProjectPicker(user, clientId) {
  if (!user.permissions.catalog) throw new Meteor.Error('403', 'No permission to access project data');
  const parsed = inputSchema.safeParse({ clientId });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const clientRes = await Clients.findOneAsync({ tenantId: user.tenantId, _id: clientId }, { fields: { name: 1 } });
  const projectsRes = await Projects.find({ tenantId: user.tenantId, clientId }, { fields: { name: 1, created: 1, open: 1 } }).fetchAsync();

  return { client: clientRes, projects: projectsRes };
}
