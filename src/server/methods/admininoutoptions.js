/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import coreLoadInOutOptions from '/src/server/core/loadInOutOptions.js';
import coreSaveInOutOptions from '/src/server/core/saveInOutOptions.js';

Meteor.methods({
  async loadInOutOptions() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreLoadInOutOptions(user);
  },
  async saveInOutOptions(inOutOptions) {
    check(inOutOptions, Array);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreSaveInOutOptions(user, inOutOptions);
  },
});
