/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Tenant } from '/src/shared/collections/collections.js';

export default async function adminLoadTeams(user) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');

  const res = await Tenant.findOneAsync({}, { fields: { teams: 1 } });
  return res.teams;
}
