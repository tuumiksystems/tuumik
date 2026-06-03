/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import coreTerminateTenant from '/src/server/core/terminateTenant.js';

Meteor.methods({
  async terminateTenant(password) {
    check(password, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTerminateTenant(user, password);
  },
});
