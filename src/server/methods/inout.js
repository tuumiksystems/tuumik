/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import coreLoadInOutBoardCurrent from '/src/server/core/loadInOutBoardCurrent.js';
import coreLoadInOutBoardHistoryFull from '/src/server/core/loadInOutBoardHistoryFull.js';
import coreLoadInOutBoardHistoryTotals from '/src/server/core/loadInOutBoardHistoryTotals.js';

Meteor.methods({
  async loadInOutBoardCurrent(args) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreLoadInOutBoardCurrent(user, args);
  },
  async loadInOutBoardHistoryFull(args) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreLoadInOutBoardHistoryFull(user, args);
  },
  async loadInOutBoardHistoryTotals(args) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreLoadInOutBoardHistoryTotals(user, args);
  },
});
