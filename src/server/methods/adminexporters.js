/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import coreLoadExporters from '/src/server/core/loadExporters.js';
import coreSaveExporters from '/src/server/core/saveExporters.js';

Meteor.methods({
  async loadExporters() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreLoadExporters(user);
  },
  async saveExporters(exporters) {
    check(exporters, Array);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreSaveExporters(user, exporters);
  },
});
