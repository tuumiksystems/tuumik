/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Tenants } from '/src/shared/collections/collections.js';

export default async function adminMainSettingsLoad(user) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access main settings');

  const res = await Tenants.findOneAsync(
    { _id: user.tenantId },
    {
      fields: {
        name: 1,
        email: 1,
        phone: 1,
        currency: 1,
        dateFormat: 1,
        timeFormat: 1,
        weekStart: 1,
        thouMark: 1,
        decimalMark: 1,
        useTaskTypesByDefault: 1,
        trackerStep: 1,
      },
    },
  );
  return res;
}
