/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import coreCreateDemo from '/src/server/core/createDemo.js';

Meteor.methods({
  async createDemo() {
    if (this.userId) throw new Meteor.Error('403', 'Cannot create demo when logged in');
    return await coreCreateDemo();
  },
});
