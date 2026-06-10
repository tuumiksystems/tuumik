/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { z } from 'zod';
import { Global, Tenants } from '/src/shared/collections/collections.js';
import inOutOptions from '/src/server/initdata/inout-options.js';
import insertInitialTaskGroups from '/src/server/initdata/taskgroups.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

const inputSchema = z.object({
  tenant: z.object({
    name: z.string(),
    email: z.string().regex(EMAIL_REGEX, 'Unrecognized email format (organization)'),
    phone: z.string().regex(PHONE_REGEX, 'Unrecognized telephone number format (organization)'),
  }),
  user: z.object({
    name: z.string(),
    email: z.string().regex(EMAIL_REGEX, 'Unrecognized email format (user)'),
  }),
  signupCode: z.string(),
});

export default async function insertTenantAndUser(args) {
  if (Meteor.settings.public.demoMode) throw new Meteor.Error('403', 'Signup not allowed');
  const global = await Global.findOneAsync();
  if (!global.allowSignup) throw new Meteor.Error('403', 'Signup not allowed');
  if (global.signupCode && !args.signupCode) throw new Meteor.Error('403', 'Signup code required');
  if (global.signupCode !== args.signupCode) throw new Meteor.Error('403', 'Incorrect signup code');

  const parsed = inputSchema.safeParse(args);
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const initialTeams = [
    { name: 'Team 1', id: '10' },
    { name: 'Team 2', id: '11' },
  ];

  const initialExportersFront = [
    { name: 'XLSX', id: '10' },
    { name: 'PDF', id: '11' },
  ];

  const initialExportersBack = [
    { name: 'XLSX', id: '10', url: 'http://export:3000/xlsx1', apiKey: 'tuumik' },
    { name: 'PDF', id: '11', url: 'http://export:3000/pdf1', apiKey: 'tuumik' },
  ];

  const tenantId = await Tenants.insertAsync({
    name: args.tenant.name,
    email: args.tenant.email,
    phone: args.tenant.phone,
    dateFormat: 'DD.MM.YYYY',
    timeFormat: 'HH:mm',
    weekStart: 'mon',
    thouMark: 'comma',
    decimalMark: 'period',
    currency: { str: 'EUR', sign: '€' },
    useTaskTypesByDefault: false,
    trackerStep: 1,
    inOutOptions,
    teams: initialTeams,
    homeView: 'recent',
    composerExportersFront: initialExportersFront,
    composerExportersBack: initialExportersBack,
    exportersIdCounter: 10,
    preventLogin: false,
    createdAt: new Date(),
  });

  await insertInitialTaskGroups(tenantId);

  const permissionsForFirstUser = {
    timeTracker: true,
    historyOthers: true,
    catalog: true,
    monitor: true,
    clientsEdit: true,
    projectsEdit: true,
    composer: true,
    inOutSelf: true,
    inOutView: true,
    inOutEditOthers: true,
    admin: true,
  };

  const profile = {
    tenantId,
    name: args.user.name,
    nameNormalized: normalizeStringForAC(args.user.name),
    permissions: permissionsForFirstUser,
  };

  const userId = await Accounts.createUserAsync({
    email: args.user.email,
    password: args.password,
    profile,
  });

  await Tenants.updateAsync(tenantId, {
    $set: {
      originalSignupData: {
        tenant: {
          name: args.tenant.name,
          email: args.tenant.email,
          phone: args.tenant.phone,
        },
        user: {
          userId,
          name: args.user.name,
          email: args.user.email,
        },
      },
    },
  });

  if (Meteor.settings.private.disableSignupAfterSignup) await Global.updateAsync({}, { $set: { allowSignup: false } });
}
