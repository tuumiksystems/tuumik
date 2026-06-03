/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import coreInsertTenantAndUser from '/src/server/core/insertTenantAndUser.js';
import coreResendEmailVerificationLink from '/src/server/core/resendEmailVerificationLink.js';
import coreSendEmailResetLink from '/src/server/core/sendEmailResetLink.js';
import coreLoadSignupSettings from '/src/server/core/loadSignupSettings.js';

Meteor.methods({
  async insertTenantAndUser(args) {
    check(args, Object);
    check(args.tenant, Object);
    check(args.user, Object);
    check(args.tenant.name, String);
    check(args.tenant.email, String);
    check(args.tenant.phone, String);
    check(args.user.name, String);
    check(args.user.email, String);
    check(args.password, Object);
    check(args.signupCode, String);
    return await coreInsertTenantAndUser(args);
  },
  async resendEmailVerificationLink() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    return await coreResendEmailVerificationLink(this.userId);
  },
  async sendEmailResetLink(email) {
    check(email, String);
    return await coreSendEmailResetLink(email);
  },
  async loadSignupSettings() {
    return await coreLoadSignupSettings();
  },
});
