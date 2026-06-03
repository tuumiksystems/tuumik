/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import coreGetUserAndTenantSelf from '/src/server/core/getUserAndTenantSelf.js';

Meteor.methods({
  async getUserAndTenantSelf() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreGetUserAndTenantSelf(user);
  },
});
