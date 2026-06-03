/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Clients, Projects } from '/src/shared/collections/collections.js';

export default async function pickClientInProjectPicker(user, clientId) {
  if (!user.permissions.catalog) throw new Meteor.Error('403', 'No permission to access project data');

  const clientRes = await Clients.findOneAsync({ tenantId: user.tenantId, _id: clientId }, { fields: { name: 1 } });
  const projectsRes = await Projects.find({ tenantId: user.tenantId, clientId }, { fields: { name: 1, created: 1, open: 1 } }).fetchAsync();

  return { client: clientRes, projects: projectsRes };
}
