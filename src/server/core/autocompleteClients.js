/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { z } from 'zod';
import { Clients } from '/src/shared/collections/collections.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

const inputSchema = z.object({
  searchString: z.string(),
});

export default async function autocompleteClients(user, searchString) {
  const parsed = inputSchema.safeParse({ searchString });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const escaped = searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const normalized = normalizeStringForAC(escaped);
  const searchQuery = new RegExp(normalized);

  const res = await Clients.find(
    {
      tenantId: user.tenantId,
      nameNormalized: searchQuery,
      $or: [{ hidden: { $ne: true } }, { allowAccess: { $in: [user._id] } }],
    },
    { fields: { name: 1 }, limit: 15 },
  ).fetchAsync();

  return res;
}
