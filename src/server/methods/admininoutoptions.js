/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import coreAdminLoadInOutOptions from '/src/server/core/adminLoadInOutOptions.js';
import coreAdminSaveInOutOptions from '/src/server/core/adminSaveInOutOptions.js';

Meteor.methods({
  async loadInOutOptions() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminLoadInOutOptions(user);
  },
  async saveInOutOptions(inOutOptions) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminSaveInOutOptions(user, inOutOptions);
  },
});
