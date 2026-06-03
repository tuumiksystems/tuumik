/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

export default async function autocompleteUsers(user, searchString) {
  const escaped = searchString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const normalized = normalizeStringForAC(escaped);
  const searchQuery = new RegExp(normalized);

  const res = await Meteor.users.find(
    { tenantId: user.tenantId, nameNormalized: searchQuery },
    { fields: { name: 1 }, limit: 15 },
  ).fetchAsync();

  return res;
}
