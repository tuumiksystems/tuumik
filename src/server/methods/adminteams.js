/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import coreAdminLoadTeams from '/src/server/core/adminLoadTeams.js';
import coreAdminSaveTeams from '/src/server/core/adminSaveTeams.js';

Meteor.methods({
  async loadTeams() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminLoadTeams(user);
  },
  async saveTeams(teams) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminSaveTeams(user, teams);
  },
});
