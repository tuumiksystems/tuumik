/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import coreLoadAllUsers from '/src/server/core/loadAllUsers.js';

Meteor.methods({
  async loadAllUsers() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreLoadAllUsers(user);
  },
});
