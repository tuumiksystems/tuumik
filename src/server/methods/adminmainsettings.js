/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import coreAdminMainSettingsLoad from '/src/server/core/adminMainSettingsLoad.js';
import coreAdminMainSettingsSave from '/src/server/core/adminMainSettingsSave.js';

Meteor.methods({
  async mainSettingsLoad() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminMainSettingsLoad(user);
  },
  async mainSettingsSave(settings) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminMainSettingsSave(user, settings);
  },
});
