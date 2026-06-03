/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import coreGetProjectForView from '/src/server/core/getProjectForView.js';
import coreGetTimesForProjectView from '/src/server/core/getTimesForProjectView.js';

Meteor.methods({
  async getProjectForView(projectId) {
    check(projectId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreGetProjectForView(user, projectId);
  },
  async getTimesForProjectView(projectId) {
    check(projectId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreGetTimesForProjectView(user, projectId);
  },
});
