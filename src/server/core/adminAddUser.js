/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { z } from 'zod';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputSchema = z.object({
  name: z.string(),
  email: z.string().regex(EMAIL_REGEX, 'Unrecognized email format'),
});

export default async function adminAddUser(user, name, email, password) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to edit users');
  const parsed = inputSchema.safeParse({ name, email });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const permissions = {};
  const profile = {
    tenantId: user.tenantId,
    name,
    nameNormalized: normalizeStringForAC(name),
    permissions,
  };
  const createdUserId = await Accounts.createUserAsync({ email, password, profile });

  return createdUserId;
}
