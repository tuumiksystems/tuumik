/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';

export default async function adminUsersList(user) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to edit users');

  return Meteor.users
    .find(
      {},
      {
        fields: { name: 1, nameShort: 1, username: 1, emails: 1, createdAt: 1, disabled: 1 },
        sort: { disabled: 1, name: 1 },
      },
    )
    .fetchAsync();
}
