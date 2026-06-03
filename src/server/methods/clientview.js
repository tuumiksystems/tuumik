/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import coreGetClientForView from '/src/server/core/getClientForView.js';
import coreGetProjectsForClientView from '/src/server/core/getProjectsForClientView.js';
import coreGetTimesForClientView from '/src/server/core/getTimesForClientView.js';

Meteor.methods({
  async getClientForView(clientId) {
    check(clientId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreGetClientForView(user, clientId);
  },
  async getProjectsForClientView(clientId) {
    check(clientId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreGetProjectsForClientView(user, clientId);
  },
  async getTimesForClientView(clientId) {
    check(clientId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreGetTimesForClientView(user, clientId);
  },
});
