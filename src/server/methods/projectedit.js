/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import coreGetProjectForEdit from '/src/server/core/getProjectForEdit.js';
import coreProjectSave from '/src/server/core/projectSave.js';
import coreProjectDelete from '/src/server/core/projectDelete.js';

Meteor.methods({
  async getProjectForEdit(projectId) {
    check(projectId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreGetProjectForEdit(user, projectId);
  },
  async projectSave(project) {
    check(project, Object);
    check(project.name, String);
    check(project.clientId, String);
    check(project.taskGroupIds, [String]);
    check(project.useTaskTypes, Boolean);
    check(project.reminder, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreProjectSave(user, project);
  },
  async projectDelete(projectId) {
    check(projectId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreProjectDelete(user, projectId);
  },
});
