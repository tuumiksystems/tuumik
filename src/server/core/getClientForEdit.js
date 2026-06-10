/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Clients } from '/src/shared/collections/collections.js';

const inputSchema = z.object({
  clientId: z.string(),
});

export default async function getClientForEdit(user, clientId) {
  if (!user.permissions.clientsEdit) throw new Meteor.Error('403', 'No permission to access client data');
  const parsed = inputSchema.safeParse({ clientId });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const clientRes = await Clients.findOneAsync(
    { tenantId: user.tenantId, _id: clientId },
    {
      fields: {
        name: 1,
        reminder: 1,
        tel: 1,
        email: 1,
        address: 1,
        created: 1,
        createdBy: 1,
        lastModified: 1,
      },
    },
  );

  if (!clientRes) throw new Meteor.Error('404', 'Specified client not found');
  return { client: clientRes };
}
