/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Clients } from '/src/shared/collections/collections.js';
import clientEdit from '/src/server/integrations/client-edit.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

export default async function clientSave(user, client) {
  if (!user.permissions.clientsEdit) throw new Meteor.Error('403', 'No permission to modify client data');
  if (client.name.length < 2) throw new Meteor.Error('405', 'Client name must be at least 2 characters');

  const clientId = client._id;
  const setObj = {};
  setObj.name = client.name;
  setObj.nameNormalized = normalizeStringForAC(client.name);
  setObj.reminder = client.reminder;
  setObj.tel = client.tel;
  setObj.email = client.email;
  setObj.address = client.address;
  setObj.lastModified = new Date();

  await Clients.updateAsync({ tenantId: user.tenantId, _id: clientId }, { $set: setObj });
  clientEdit({ client });
}
