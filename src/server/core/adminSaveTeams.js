/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Tenants } from '/src/shared/collections/collections.js';
import adminLoadTeams from '/src/server/core/adminLoadTeams.js';

const inputSchema = z.array(
  z.object({ id: z.string().optional(), name: z.string() }).passthrough(),
);

export default async function adminSaveTeams(user, teams) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');
  const parsed = inputSchema.safeParse(teams);
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const tenant = await Tenants.findOneAsync(user.tenantId);
  let idCounter = Number.parseInt(tenant.teamsIdCounter, 10) || 10;
  const teamsProcessed = teams.map(team => {
    if (team.id) return { ...team };
    idCounter += 1;
    return { ...team, id: String(idCounter) };
  });
  await Tenants.updateAsync({ _id: user.tenantId }, { $set: { teams: teamsProcessed, teamsIdCounter: idCounter } });

  return adminLoadTeams(user);
}
