/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import coreTeamMonitorLoad from '/src/server/core/teamMonitorLoad.js';

Meteor.methods({
  async teamMonitorLoad(dates, teamId, userId) {
    check(dates, Object);
    check(teamId, String);
    check(userId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTeamMonitorLoad(user, dates, teamId, userId);
  },
});
