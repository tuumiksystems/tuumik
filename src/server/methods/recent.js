/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import coreLoadRecentTimes from '/src/server/core/loadRecentTimes.js';

Meteor.methods({
  async loadRecentTimes(cutoff) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreLoadRecentTimes(user, cutoff);
  },
});
