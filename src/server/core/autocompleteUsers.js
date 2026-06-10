/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

const inputSchema = z.object({
  searchString: z.string(),
});

export default async function autocompleteUsers(user, searchString) {
  const parsed = inputSchema.safeParse({ searchString });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const escaped = searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const normalized = normalizeStringForAC(escaped);
  const searchQuery = new RegExp(normalized);

  const res = await Meteor.users.find(
    { tenantId: user.tenantId, nameNormalized: searchQuery },
    { fields: { name: 1 }, limit: 15 },
  ).fetchAsync();

  return res;
}
