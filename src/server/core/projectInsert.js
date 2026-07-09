/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Projects, Clients, Tenant } from '/src/shared/collections/collections.js';
import projectAdd from '/src/server/integrations/project-add.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

const inputSchema = z.object({
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  clientId: z.string(),
});

export default async function projectInsert(user, name, clientId) {
  if (!user.permissions.projectsEdit) throw new Meteor.Error('403', 'No permission to add projects');
  const parsed = inputSchema.safeParse({ name, clientId });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  if (!Clients.findOneAsync({ _id: clientId })) throw new Meteor.Error('404', 'No client found');

  const tenant = await Tenant.findOneAsync();

  const doc = {
    name,
    nameNormalized: normalizeStringForAC(name),
    clientId,
    taskGroupIds: [],
    useTaskTypes: !!tenant.useTaskTypesByDefault,
    reminder: '',
    createdAt: new Date(),
    createdBy: { id: user._id, name: user.name },
    modifiedAt: new Date(),
    modifiedBy: { id: user._id, name: user.name },
  };

  const id = await Projects.insertAsync(doc);
  projectAdd({ name, clientId });
  return id;
}
