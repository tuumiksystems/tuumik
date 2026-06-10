/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';

export default async function loadAllUsers(user) {
  return Meteor.users
    .find(
      { tenantId: user.tenantId },
      {
        fields: { name: 1, inTeams: 1, inOutShow: 1, disabled: 1 },
      },
    )
    .fetchAsync();
}
