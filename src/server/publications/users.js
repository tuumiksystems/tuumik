/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';

Meteor.publish('usersSelf', async function() {
  if (!this.userId) {
    return this.ready();
  }

  const user = await Meteor.users.findOneAsync(this.userId);
  return Meteor.users.find(
    { _id: user._id },
    {
      fields: {
        name: 1,
        nameShort: 1,
        emails: 1,
        trackerSimple: 1,
        defaultClientId: 1,
        defaultProjectId: 1,
        inOutStatus: 1,
        inOutNote: 1,
        permissions: 1,
        pic: 1,
        timezone: 1,
      },
    },
  );
});
