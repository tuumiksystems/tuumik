/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import coreAdminTerminateTenant from '/src/server/core/adminTerminateTenant.js';

Meteor.methods({
  async terminateTenant(password) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminTerminateTenant(user, password);
  },
});
