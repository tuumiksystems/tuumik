/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import coreGetApiKeysSelf from '/src/server/core/getApiKeysSelf.js';
import coreCreateApiKeySelf from '/src/server/core/createApiKeySelf.js';
import coreRemoveApiKeySelf from '/src/server/core/removeApiKeySelf.js';

Meteor.methods({
  async getApiKeysSelf() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreGetApiKeysSelf(user);
  },
  async createApiKeySelf(role, desc) {
    check(role, String);
    check(desc, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreCreateApiKeySelf(user, role, desc);
  },
  async removeApiKeySelf(apiKeyId) {
    check(apiKeyId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreRemoveApiKeySelf(user, apiKeyId);
  },
});
