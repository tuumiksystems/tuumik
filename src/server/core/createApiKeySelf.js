/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import crypto from 'node:crypto';
import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const inputSchema = z.object({
  role: z.enum(['regularReadOnly', 'regularReadWrite', 'admin']),
  desc: z.string(),
});

export default async function createApiKeySelf(user, role, desc) {
  if (!user.apiKeyCreation) throw new Meteor.Error('403', 'No permission to create API keys');
  if (user.apiKeys.length > 9) throw new Meteor.Error('403', 'User cannot have more API keys, limit reached');
  const parsed = inputSchema.safeParse({ role, desc });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  // generate key id that is unique across all users
  let id;
  do {
    id = crypto.randomBytes(5).toString('hex');
  } while (await Meteor.users.findOneAsync({ 'apiKeys.id': id }));

  // expiry
  const expiryDays = Number(process.env.USER_API_KEY_EXPIRY_DAYS);
  const expires = Number.isInteger(expiryDays) && expiryDays > 0 ? dayjs.utc().add(expiryDays, 'days').toDate() : null;

  // generate secret, create token from id and secret and hash it
  const secret = crypto.randomBytes(20).toString('hex');
  const token = `${id}-${secret}`;
  const tokenHashed = crypto.createHash('sha256').update(token).digest('hex');
  const newApiKey = { id, tokenHash: tokenHashed, role, desc, expires, created: new Date() };

  await Meteor.users.updateAsync({ _id: user._id }, { $push: { apiKeys: newApiKey } });
  return { createdToken: token };
}
