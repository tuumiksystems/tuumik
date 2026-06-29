/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Tenant } from '/src/shared/collections/collections.js';

const inputSchema = z.object({
  searchedUserId: z.string(),
  teamId: z.string(),
});

export default async function loadInOutBoardCurrent(user, args) {
  const { searchedUserId, teamId } = args;
  if (!user.permissions.inOutView) throw new Meteor.Error('403', 'No permission to view in/out board');
  const parsed = inputSchema.safeParse(args);
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const tenant = await Tenant.findOneAsync();
  const { inOutOptions } = tenant;

  const queryForSearch = {
    _id: searchedUserId,
    inOutShow: true,
    disabled: { $ne: true },
  };

  const queryForTeams = {
    inTeams: teamId,
    inOutShow: true,
    disabled: { $ne: true },
  };

  const query = searchedUserId ? queryForSearch : queryForTeams;

  const usersRes = await Meteor.users.find(query, {
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

  // join options
  const usersWithOptionsJoined = usersRes.map(u => {
    const option = inOutOptions.find(opt => opt.id === u.inOutStatus);
    return {
      ...u,
      text: option?.text,
      work: option?.work,
    };
  });
  // /join options

  return {
    users: usersWithOptionsJoined,
    inOutOptions,
  };
}
