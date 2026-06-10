/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Clients, Projects } from '/src/shared/collections/collections.js';

const inputSchema = z.object({
  projectId: z.string(),
});

export default async function pickProjectInProjectPicker(user, projectId) {
  if (!user.permissions.catalog) throw new Meteor.Error('403', 'No permission to access project data');
  const parsed = inputSchema.safeParse({ projectId });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const projectRes = await Projects.findOneAsync({ tenantId: user.tenantId, _id: projectId }, { fields: { name: 1, clientId: 1, created: 1, open: 1 } });
  const clientRes = await Clients.findOneAsync({ tenantId: user.tenantId, _id: projectRes.clientId }, { fields: { name: 1 } });

  return { client: clientRes, project: projectRes };
}
