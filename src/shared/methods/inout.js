/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import coreSetInOutSelf from '/src/shared/core/setInOutSelf.js';
import coreSetInOutOthers from '/src/shared/core/setInOutOthers.js';

Meteor.methods({
  async setInOutSelf(board) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreSetInOutSelf(user, board);
  },
  async setInOutOthers(targetUserId, board) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreSetInOutOthers(user, targetUserId, board);
  },
});
