/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Tenant } from '/src/shared/collections/collections.js';
import insertDemoTenant from '/src/server/demodata/tenant.js';
import insertDemoAccounts from '/src/server/demodata/accounts.js';
import insertDemoClients from '/src/server/demodata/clients.js';
import insertDemoProjects from '/src/server/demodata/projects.js';
import insertDemoTimes from '/src/server/demodata/times.js';
import insertDemoStatuses from '/src/server/demodata/statuses.js';
import insertInitialTaskGroups from '/src/server/initdata/taskgroups.js';
import removeTenantData from '/src/server/termination/remove-tenant-data.js';

// How long before demo data is considered stale and rebuilt on next entry.
// Read from the environment (in hours), falling back to 24.
const DEMO_MAX_AGE_HOURS = Number.parseInt(process.env.DEMO_MAX_AGE_HOURS, 10) || 24;
const DEMO_MAX_AGE_MS = DEMO_MAX_AGE_HOURS * 60 * 60 * 1000;

async function createDemoData() {
  await insertDemoTenant();
  await insertInitialTaskGroups();
  await insertDemoAccounts();
  await insertDemoClients();
  await insertDemoProjects();
  // statuses first: timesheet entries are derived from the generated in/out
  // work periods so the two stay consistent
  await insertDemoStatuses();
  await insertDemoTimes();
}

// Pick a user account to enter the demo with. First choose randomly among accounts
// that have never been used for demo entry. Once all accounts have been used, pick
// the one whose last demo entry is furthest in the past.
async function pickDemoUser() {
  const neverEntered = await Meteor.users.find({ lastDemoEntry: { $exists: false } }).fetchAsync();
  if (neverEntered.length) {
    return neverEntered[Math.floor(Math.random() * neverEntered.length)];
  }
  return Meteor.users.findOneAsync({}, { sort: { lastDemoEntry: 1 } });
}

export default async function createDemo(demoResetPassword) {
  if (!Meteor.settings.public.demoMode) throw new Meteor.Error('403', 'App is not running in demo mode');

  // A correct reset password forces an immediate wipe and rebuild of the demo data,
  // without waiting for it to go stale. Only available when the DEMO_RESET_PASSWORD
  // environment variable is set.
  let forceReset = false;
  if (demoResetPassword) {
    if (!process.env.DEMO_RESET_PASSWORD || demoResetPassword !== process.env.DEMO_RESET_PASSWORD) {
      throw new Meteor.Error('403', 'Invalid demo reset password');
    }
    forceReset = true;
  }

  const tenant = await Tenant.findOneAsync();

  if (!tenant) {
    await createDemoData();
  } else {
    // Guard against demo mode being enabled by mistake on a real production instance:
    // never wipe data or log visitors in when the existing tenant is not a demo tenant.
    if (!tenant.demo) throw new Meteor.Error('403', 'Issue found with demo data, please make sure demo mode is not enabled by mistake');

    const demoExpired = Date.now() - new Date(tenant.createdAt).getTime() > DEMO_MAX_AGE_MS;
    if (forceReset || demoExpired) {
      await removeTenantData();
      await createDemoData();
    }
  }

  const user = await pickDemoUser();
  await Meteor.users.updateAsync(user._id, { $set: { lastDemoEntry: new Date() } });

  return user.emails[0].address;
}
