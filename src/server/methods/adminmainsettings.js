/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import coreMainSettingsLoad from '/src/server/core/mainSettingsLoad.js';
import coreMainSettingsSave from '/src/server/core/mainSettingsSave.js';

Meteor.methods({
  async mainSettingsLoad() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreMainSettingsLoad(user);
  },
  async mainSettingsSave(settings) {
    check(settings, Object);
    check(settings.name, String);
    check(settings.email, String);
    check(settings.phone, String);
    check(settings.currency, Object);
    check(settings.dateFormat, String);
    check(settings.timeFormat, String);
    check(settings.weekStart, String);
    check(settings.thouMark, String);
    check(settings.decimalMark, String);
    check(settings.useTaskTypesByDefault, Boolean);
    check(settings.trackerStep, Number);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreMainSettingsSave(user, settings);
  },
});
