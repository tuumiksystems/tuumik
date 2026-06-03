/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import coreGetTaskGroups from '/src/server/core/getTaskGroups.js';

Meteor.methods({
  async getTaskGroups() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreGetTaskGroups(user);
  },
});
