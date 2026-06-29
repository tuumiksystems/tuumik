/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import coreGetProjectForEdit from '/src/server/core/getProjectForEdit.js';
import coreProjectUpdate from '/src/server/core/projectUpdate.js';
import coreProjectDelete from '/src/server/core/projectDelete.js';

Meteor.methods({
  async getProjectForEdit(projectId) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreGetProjectForEdit(user, projectId);
  },
  async projectUpdate(project) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreProjectUpdate(user, project);
  },
  async projectDelete(projectId) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreProjectDelete(user, projectId);
  },
});
