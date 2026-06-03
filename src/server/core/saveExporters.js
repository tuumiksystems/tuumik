/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Tenants } from '/src/shared/collections/collections.js';
import loadExporters from '/src/server/core/loadExporters.js';

export default async function saveExporters(user, exporters) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');

  const tenant = await Tenants.findOneAsync(user.tenantId);
  let idCounter = Number.parseInt(tenant.exportersIdCounter, 10) || 10;
  const exportersProcessed = exporters.map(exporter => {
    if (exporter.id) return { ...exporter };
    idCounter += 1;
    return { ...exporter, id: String(idCounter) };
  });
  const composerExportersFront = exportersProcessed.map(x => {
    return { id: x.id, name: x.name };
  });
  await Tenants.updateAsync({ _id: user.tenantId }, { $set: { composerExportersBack: exportersProcessed, composerExportersFront, exportersIdCounter: idCounter } });

  return loadExporters(user);
}
