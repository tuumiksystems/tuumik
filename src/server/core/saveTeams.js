/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Tenants } from '/src/shared/collections/collections.js';
import loadTeams from '/src/server/core/loadTeams.js';

export default async function saveTeams(user, teams) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');

  const tenant = await Tenants.findOneAsync(user.tenantId);
  let idCounter = Number.parseInt(tenant.teamsIdCounter, 10) || 10;
  const teamsProcessed = teams.map(team => {
    if (team.id) return { ...team };
    idCounter += 1;
    return { ...team, id: String(idCounter) };
  });
  await Tenants.updateAsync({ _id: user.tenantId }, { $set: { teams: teamsProcessed, teamsIdCounter: idCounter } });

  return loadTeams(user);
}
