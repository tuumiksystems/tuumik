/* Copyright (C) 2026 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import coreOauthApproveAuthorization from '/src/server/core/oauthApproveAuthorization.js';
import coreOauthGetClientForConsent from '/src/server/core/oauthGetClientForConsent.js';
import coreOauthGetGrantsSelf from '/src/server/core/oauthGetGrantsSelf.js';
import coreOauthRemoveGrantSelf from '/src/server/core/oauthRemoveGrantSelf.js';

Meteor.methods({
  async getOauthClientForConsent(clientId, redirectUri) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    return await coreOauthGetClientForConsent(clientId, redirectUri);
  },
  async approveOauthAuthorization(params) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreOauthApproveAuthorization(user, params);
  },
  async getOauthGrantsSelf() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreOauthGetGrantsSelf(user);
  },
  async removeOauthGrantSelf(grantId) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreOauthRemoveGrantSelf(user, grantId);
  },
});
