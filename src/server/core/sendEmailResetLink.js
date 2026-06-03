/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { isValidEmailAddress } from '/src/server/utils/validation';

export default async function sendEmailResetLink(email) {
  if (!isValidEmailAddress(email)) throw new Meteor.Error('405', 'Unrecognized email format');
  const user = await Accounts.findUserByEmail(email);
  if (!user) throw new Meteor.Error('401', 'Email not found');
  await Accounts.sendResetPasswordEmail(user._id);
}
