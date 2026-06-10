/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { z } from 'zod';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputSchema = z.object({
  email: z.string().regex(EMAIL_REGEX, 'Unrecognized email format'),
});

export default async function sendEmailResetLink(email) {
  const parsed = inputSchema.safeParse({ email });
  if (!parsed.success) throw new Meteor.Error('405', parsed.error.issues[0].message);

  const user = await Accounts.findUserByEmail(email);
  if (!user) throw new Meteor.Error('401', 'Email not found');
  await Accounts.sendResetPasswordEmail(user._id);
}
