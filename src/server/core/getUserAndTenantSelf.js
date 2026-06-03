/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Tenants } from '/src/shared/collections/collections.js';

export default async function getUserAndTenantSelf(user) {
  const currentUser = await Meteor.users.findOneAsync(
    { _id: user._id },
    {
      fields: {
        tenantId: 1,
        name: 1,
        emails: 1,
        trackerSimple: 1,
        defaultClientId: 1,
        defaultProjectId: 1,
        inOutStatus: 1,
        inOutNote: 1,
        permissions: 1,
        pic: 1,
      },
    },
  );

  if (!currentUser) throw new Meteor.Error('404', 'User not found');

  const tenant = await Tenants.findOneAsync(
    { _id: user.tenantId },
    {
      fields: {
        name: 1,
        numberFormat: 1,
        dateFormat: 1,
        timeFormat: 1,
        weekStart: 1,
        thouMark: 1,
        decimalMark: 1,
        currency: 1,
        useTaskTypesByDefault: 1,
        trackerStep: 1,
        teams: 1,
        composerExportersFront: 1,
        homeView: 1,
        inOutOptions: 1,
      }
    }
  );

  if (!tenant) throw new Meteor.Error('404', 'Tenant not found');

  return { user: currentUser, tenant };
}
