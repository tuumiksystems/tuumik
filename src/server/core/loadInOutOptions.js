/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Tenants } from '/src/shared/collections/collections.js';

export default async function loadInOutOptions(user) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');

  const res = await Tenants.findOneAsync({ _id: user.tenantId }, { fields: { inOutOptions: 1 } });
  return res.inOutOptions;
}
