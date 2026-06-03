/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import coreLoadTeams from '/src/server/core/loadTeams.js';
import coreSaveTeams from '/src/server/core/saveTeams.js';

Meteor.methods({
  async loadTeams() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreLoadTeams(user);
  },
  async saveTeams(teams) {
    check(teams, Array);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreSaveTeams(user, teams);
  },
});
