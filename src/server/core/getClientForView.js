/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Clients } from '/src/shared/collections/collections.js';

export default async function getClientForView(user, clientId) {
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
        lastModified: 1,
      },
    },
  );

  if (!clientRes) throw new Meteor.Error('404', 'Specified client not found');
  return { client: clientRes };
}
