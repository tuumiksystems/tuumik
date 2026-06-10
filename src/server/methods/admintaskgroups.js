/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import coreAdminLoadTaskGroups from '/src/server/core/adminLoadTaskGroups.js';
import coreAdminLoadTaskGroupForEdit from '/src/server/core/adminLoadTaskGroupForEdit.js';
import coreAdminInsertTaskGroup from '/src/server/core/adminInsertTaskGroup.js';
import coreAdminSaveTaskGroup from '/src/server/core/adminSaveTaskGroup.js';
import coreAdminDeleteTaskGroup from '/src/server/core/adminDeleteTaskGroup.js';

Meteor.methods({
  async loadTaskGroups() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminLoadTaskGroups(user);
  },
  async loadTaskGroupForEdit(taskGroupId) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminLoadTaskGroupForEdit(user, taskGroupId);
  },
  async insertTaskGroup(name) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminInsertTaskGroup(user, name);
  },
  async saveTaskGroup(taskGroup) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminSaveTaskGroup(user, taskGroup);
  },
  async deleteTaskGroup(taskGroupId) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminDeleteTaskGroup(user, taskGroupId);
  },
});
