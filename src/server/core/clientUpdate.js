/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Clients } from '/src/shared/collections/collections.js';
import clientEdit from '/src/server/integrations/client-edit.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

const inputSchema = z.object({
  _id: z.string(),
  name: z.string().min(2, 'Client name must be at least 2 characters').optional(),
  reminder: z.string().optional(),
  tel: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
});

export default async function clientUpdate(user, client) {
  if (!user.permissions.clientsEdit) throw new Meteor.Error('403', 'No permission to modify client data');
  const parsed = inputSchema.safeParse(client);
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const setObj = { modifiedAt: new Date(), modifiedBy: { id: user._id, name: user.name } };
  if (client.name !== undefined) {
    setObj.name = client.name;
    setObj.nameNormalized = normalizeStringForAC(client.name);
  }
  if (client.reminder !== undefined) setObj.reminder = client.reminder;
  if (client.tel !== undefined) setObj.tel = client.tel;
  if (client.email !== undefined) setObj.email = client.email;
  if (client.address !== undefined) setObj.address = client.address;

  await Clients.updateAsync({ _id: client._id }, { $set: setObj });
  clientEdit({ client });
}
