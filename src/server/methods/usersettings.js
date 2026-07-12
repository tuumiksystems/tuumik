/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import coreGetApiKeysSelf from '/src/server/core/getApiKeysSelf.js';
import coreCreateApiKeySelf from '/src/server/core/createApiKeySelf.js';
import coreRemoveApiKeySelf from '/src/server/core/removeApiKeySelf.js';
import coreGetAiSettingsSelf from '/src/server/core/getAiSettingsSelf.js';
import coreSaveAiSettingsSelf from '/src/server/core/saveAiSettingsSelf.js';

Meteor.methods({
  async getApiKeysSelf() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreGetApiKeysSelf(user);
  },
  async createApiKeySelf(role, desc) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreCreateApiKeySelf(user, role, desc);
  },
  async removeApiKeySelf(apiKeyId) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreRemoveApiKeySelf(user, apiKeyId);
  },
  async getAiSettingsSelf() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreGetAiSettingsSelf(user);
  },
  async saveAiSettingsSelf(settings) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreSaveAiSettingsSelf(user, settings);
  },
});
