/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Clients, Projects } from '/src/shared/collections/collections.js';
import clientDelete from '/src/server/integrations/client-delete.js';

const inputSchema = z.object({
  clientId: z.string(),
});

export default async function clientDeleteFn(user, clientId) {
  if (!user.permissions.clientsEdit) throw new Meteor.Error('403', 'No permission to access client data');
  const parsed = inputSchema.safeParse({ clientId });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const project = await Projects.findOneAsync({ tenantId: user.tenantId, clientId });
  if (project) throw new Meteor.Error('405', 'Cannot delete client since it has projects');

  await Meteor.users.updateAsync({ defaultClientId: clientId }, { $set: { defaultClientId: '' } });
  await Clients.removeAsync({ tenantId: user.tenantId, _id: clientId });
  clientDelete({ clientId });
}
