/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { isValidEmailAddress } from '/src/server/utils/validation';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

export default async function addUser(user, name, email, password) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to edit users');
  if (!isValidEmailAddress(email)) throw new Meteor.Error('403', 'Unrecognized email format');

  const permissions = {};
  const profile = {
    tenantId: user.tenantId,
    name,
    nameNormalized: normalizeStringForAC(name),
    permissions,
  };
  const createdUserId = await Accounts.createUserAsync({ email, password, profile });

  return createdUserId;
}
