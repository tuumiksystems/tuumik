/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';

const inputSchema = z.object({
  searchedUserId: z.string(),
  teamId: z.string(),
});

export default async function loadInOutBoard(user, args) {
  const { searchedUserId, teamId } = args;
  if (!user.permissions.inOutView) throw new Meteor.Error('403', 'No permission to view in/out board');
  const parsed = inputSchema.safeParse(args);
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const queryForSearch = {
    tenantId: user.tenantId,
    _id: searchedUserId,
    inOutShow: true,
    disabled: { $ne: true },
  };

  const queryForTeams = {
    tenantId: user.tenantId,
    inTeams: teamId,
    inOutShow: true,
    disabled: { $ne: true },
  };

  const query = searchedUserId ? queryForSearch : queryForTeams;

  return Meteor.users.find(query, {
    fields: {
      name: 1,
      pic: 1,
      inOutShow: 1,
      inOutStatus: 1,
      inOutETA: 1,
      inOutNote: 1,
      inOutUpdateById: 1,
      inOutUpdateByName: 1,
      inOutUpdateAt: 1,
      inTeams: 1,
    },
  }).fetchAsync();
}
