/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Clients, Projects } from '/src/shared/collections/collections.js';

export default async function pickProjectInProjectPicker(user, projectId) {
  if (!user.permissions.catalog) throw new Meteor.Error('403', 'No permission to access project data');

  const projectRes = await Projects.findOneAsync({ tenantId: user.tenantId, _id: projectId }, { fields: { name: 1, clientId: 1, created: 1, open: 1 } });
  const clientRes = await Clients.findOneAsync({ tenantId: user.tenantId, _id: projectRes.clientId }, { fields: { name: 1 } });

  return { client: clientRes, project: projectRes };
}
