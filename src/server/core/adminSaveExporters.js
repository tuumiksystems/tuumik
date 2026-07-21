/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Tenant } from '/src/shared/collections/collections.js';
import adminLoadExporters from '/src/server/core/adminLoadExporters.js';

const inputSchema = z.array(
  z.object({ id: z.string().optional(), name: z.string() }).passthrough(),
);

export default async function adminSaveExporters(user, exporters) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');
  if (Meteor.settings.public.demoPublic) throw new Meteor.Error('403', 'This feature is not enabled in this public demo');
  const parsed = inputSchema.safeParse(exporters);
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const tenant = await Tenant.findOneAsync();
  let idCounter = Number.parseInt(tenant.exportersIdCounter, 10) || 10;
  const exportersProcessed = exporters.map(exporter => {
    if (exporter.id) return { ...exporter };
    idCounter += 1;
    return { ...exporter, id: String(idCounter) };
  });
  const composerExportersFront = exportersProcessed.map(x => {
    return { id: x.id, name: x.name };
  });
  await Tenant.updateAsync({}, { $set: { composerExportersBack: exportersProcessed, composerExportersFront, exportersIdCounter: idCounter } });

  return adminLoadExporters(user);
}
