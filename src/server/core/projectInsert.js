/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Projects, Clients, Tenants } from '/src/shared/collections/collections.js';
import projectAdd from '/src/server/integrations/project-add.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

export default async function projectInsert(user, name, clientId) {
  if (!user.permissions.projectsEdit) throw new Meteor.Error('403', 'No permission to add projects');
  if (name.length < 2) throw new Meteor.Error('405', 'Project name must be at least 2 characters');
  if (!Clients.findOneAsync({ tenantId: user.tenantId, _id: clientId })) throw new Meteor.Error('404', 'No client found');

  const tenant = await Tenants.findOneAsync(user.tenantId);

  const doc = {
    tenantId: user.tenantId,
    name,
    nameNormalized: normalizeStringForAC(name),
    clientId,
    taskGroupIds: [],
    useTaskTypes: !!tenant.useTaskTypesByDefault,
    reminder: '',
    created: new Date(),
    lastModified: new Date(),
  };

  const id = await Projects.insertAsync(doc);
  projectAdd({ name, clientId });
  return id;
}
