/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Projects, Clients } from '/src/shared/collections/collections.js';

export default async function projectHistory(user) {
  if (!user.permissions.projectsEdit) throw new Meteor.Error('403', 'No permission to add projects');

  const projectsRes = await Projects.find(
    { tenantId: user.tenantId },
    {
      fields: { name: 1, clientId: 1, created: 1 },
      sort: { created: -1 },
      limit: 10,
    },
  ).fetchAsync();

  // join clients
  const clientIds = [...new Set(projectsRes.map(project => project.clientId))].sort();
  const clientsRes = await Clients.find({ tenantId: user.tenantId, _id: { $in: clientIds } }, { fields: { name: 1 } }).fetchAsync();
  const projectsWithClientsJoined = projectsRes.map(project => {
    const x = project;
    const clientDoc = clientsRes.find(client => client._id === project.clientId);
    if (clientDoc?.name) x.clientName = clientDoc.name;
    return x;
  });

  return projectsWithClientsJoined;
}
