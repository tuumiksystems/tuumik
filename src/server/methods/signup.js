/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import coreInsertTenantAndUser from '/src/server/core/insertTenantAndUser.js';
import coreResendEmailVerificationLink from '/src/server/core/resendEmailVerificationLink.js';
import coreSendEmailResetLink from '/src/server/core/sendEmailResetLink.js';
import coreLoadSignupSettings from '/src/server/core/loadSignupSettings.js';

Meteor.methods({
  async insertTenantAndUser(args) {
    return await coreInsertTenantAndUser(args);
  },
  async resendEmailVerificationLink() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    return await coreResendEmailVerificationLink(this.userId);
  },
  async sendEmailResetLink(email) {
    return await coreSendEmailResetLink(email);
  },
  async loadSignupSettings() {
    return await coreLoadSignupSettings();
  },
});
