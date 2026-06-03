/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Clients } from '/src/shared/collections/collections.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

export default async function autocompleteClients(user, searchString) {
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
