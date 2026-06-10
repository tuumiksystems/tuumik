/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import removeTenantData from '/src/server/termination/remove-tenant-data.js';

const inputSchema = z.object({
  password: z.string(),
});

export default async function adminTerminateTenant(user, password) {
  if (!Meteor.settings.private.tenantDeletionByTenant) throw new Meteor.Error('403', 'Tenant deletion not allowed by server configuration. Please contact your administrator.');
  const parsed = inputSchema.safeParse({ password });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);
  if (!password || password !== Meteor.settings.private.tenantDeletionPassword) throw new Meteor.Error('401', 'Incorrect tenant deletion password');
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access this section');

  try {
    await removeTenantData(user.tenantId);
  } catch (error) {
    throw new Meteor.Error('403', 'Tenant termination failed');
  }
}
