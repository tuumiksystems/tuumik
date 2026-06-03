/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import coreClientInsert from '/src/server/core/clientInsert.js';
import coreClientHistory from '/src/server/core/clientHistory.js';

Meteor.methods({
  async clientInsert(name) {
    check(name, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreClientInsert(user, name);
  },
  async clientHistory() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreClientHistory(user);
  },
});
