/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import corePickClientInProjectPicker from '/src/server/core/pickClientInProjectPicker.js';
import corePickProjectInProjectPicker from '/src/server/core/pickProjectInProjectPicker.js';

Meteor.methods({
  async pickClientInProjectPicker(clientId) {
    check(clientId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await corePickClientInProjectPicker(user, clientId);
  },
  async pickProjectInProjectPicker(projectId) {
    check(projectId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await corePickProjectInProjectPicker(user, projectId);
  },
});
