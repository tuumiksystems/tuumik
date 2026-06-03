/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Accounts } from 'meteor/accounts-base';

export default async function resendEmailVerificationLink(userId) {
  await Accounts.sendVerificationEmail(userId);
}
