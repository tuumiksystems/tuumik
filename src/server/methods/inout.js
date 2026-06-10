/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import coreLoadInOutBoard from '/src/server/core/loadInOutBoard.js';
import coreLoadInOutBoardHistory from '/src/server/core/loadInOutBoardHistory.js';

Meteor.methods({
  async loadInOutBoard(args) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreLoadInOutBoard(user, args);
  },

  async loadInOutBoardHistory(args) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreLoadInOutBoardHistory(user, args);
  },
});
