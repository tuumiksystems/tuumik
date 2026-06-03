/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import coreUserMonitorLoad from '/src/server/core/userMonitorLoad.js';

Meteor.methods({
  async userMonitorLoad(dates, userId) {
    check(dates, Object);
    check(userId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreUserMonitorLoad(user, dates, userId);
  },
});
