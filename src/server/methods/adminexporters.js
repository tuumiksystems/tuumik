/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import coreAdminLoadExporters from '/src/server/core/adminLoadExporters.js';
import coreAdminSaveExporters from '/src/server/core/adminSaveExporters.js';

Meteor.methods({
  async loadExporters() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminLoadExporters(user);
  },
  async saveExporters(exporters) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminSaveExporters(user, exporters);
  },
});
