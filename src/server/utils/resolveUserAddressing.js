/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';

// Resolves user addressing for query endpoints. The caller has already
// zod-validated that exactly one of userIds | teamId | allUsers was provided.
// Explicit userIds are honored even for disabled users; teamId and the
// all-users default exclude disabled users.
export default async function resolveUserAddressing({ userIds, teamId }) {
  let query;
  let mode = 'allUsers';
  if (userIds) {
    query = { _id: { $in: [...new Set(userIds)] } };
    mode = 'userIds';
  } else if (teamId) {
    query = { inTeams: teamId, disabled: { $ne: true } };
    mode = 'teamId';
  } else {
    query = { disabled: { $ne: true } };
  }
  const users = await Meteor.users
    .find(query, { fields: { name: 1, timezone: 1, disabled: 1, inTeams: 1, inOutStatus: 1, inOutNote: 1, inOutETA: 1, inOutUpdateAt: 1, inOutUpdaters: 1, createdAt: 1 } })
    .fetchAsync();
  return { users, userIds: users.map(u => u._id), mode };
}
