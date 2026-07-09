/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Tenant } from '/src/shared/collections/collections.js';

export default async function adminMainSettingsLoad(user) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access main settings');

  const res = await Tenant.findOneAsync(
    {},
    {
      fields: {
        name: 1,
        email: 1,
        phone: 1,
        currency: 1,
        dateFormat: 1,
        timeFormat: 1,
        defaultTimezone: 1,
        weekStart: 1,
        thouMark: 1,
        decimalMark: 1,
        useTaskTypesByDefault: 1,
        trackerStep: 1,
        aiInstructions: 1,
      },
    },
  );
  return res;
}
