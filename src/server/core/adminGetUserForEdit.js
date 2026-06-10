/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Tenants, Clients, Projects } from '/src/shared/collections/collections.js';

const inputSchema = z.object({
  userId: z.string(),
});

export default async function adminGetUserForEdit(user, userId) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to edit users');
  const parsed = inputSchema.safeParse({ userId });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const tenant = await Tenants.findOneAsync(user.tenantId);

  const editedUser = await Meteor.users.findOneAsync(
    { tenantId: user.tenantId, _id: userId },
    {
      fields: {
        name: 1,
        pic: 1,
        emails: 1,
        inOutShow: 1,
        username: 1,
        permissions: 1,
        trackerSimple: 1,
        defaultClientId: 1,
        defaultProjectId: 1,
        inTeams: 1,
        apiKeyCreation: 1,
        created: 1,
        disabled: 1,
      },
    },
  );

  if (!editedUser) throw new Meteor.Error('404', 'User not found');

  if (editedUser.defaultClientId) {
    const client = await Clients.findOneAsync(editedUser.defaultClientId);
    editedUser.defaultClientName = client ? client.name : '';
  } else {
    editedUser.defaultClientName = '';
  }

  if (editedUser.defaultProjectId) {
    const project = await Projects.findOneAsync(editedUser.defaultProjectId);
    editedUser.defaultProjectName = project ? project.name : '';
  } else {
    editedUser.defaultProjectName = '';
  }

  return { editedUser, allowedPermissions: tenant.allowedPermissions };
}
