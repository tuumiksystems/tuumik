/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import coreLoadTaskGroups from '/src/server/core/loadTaskGroups.js';
import coreLoadTaskGroupForEdit from '/src/server/core/loadTaskGroupForEdit.js';
import coreInsertTaskGroup from '/src/server/core/insertTaskGroup.js';
import coreSaveTaskGroup from '/src/server/core/saveTaskGroup.js';
import coreDeleteTaskGroup from '/src/server/core/deleteTaskGroup.js';

Meteor.methods({
  async loadTaskGroups() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreLoadTaskGroups(user);
  },
  async loadTaskGroupForEdit(taskGroupId) {
    check(taskGroupId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreLoadTaskGroupForEdit(user, taskGroupId);
  },
  async insertTaskGroup(name) {
    check(name, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreInsertTaskGroup(user, name);
  },
  async saveTaskGroup(taskGroup) {
    check(taskGroup, Object);
    check(taskGroup._id, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreSaveTaskGroup(user, taskGroup);
  },
  async deleteTaskGroup(taskGroupId) {
    check(taskGroupId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreDeleteTaskGroup(user, taskGroupId);
  },
});
