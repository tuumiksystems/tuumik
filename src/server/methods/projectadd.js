/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import coreProjectInsert from '/src/server/core/projectInsert.js';
import coreProjectHistory from '/src/server/core/projectHistory.js';

Meteor.methods({
  async projectInsert(name, clientId) {
    check(name, String);
    check(clientId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreProjectInsert(user, name, clientId);
  },
  async projectHistory() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreProjectHistory(user);
  },
});
