/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Clients } from '/src/shared/collections/collections.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';
import { Random } from 'meteor/random';

const DAY_MS = 24 * 60 * 60 * 1000;
// mirrors DEMO_PERIOD_DAYS in statuses.js: client creation is split around the
// demo activity window so both client-age question families have real data
const DEMO_PERIOD_DAYS = Number.parseInt(process.env.DEMO_PERIOD_DAYS, 10) || 21;

export default async () => {
  const docs = [];

  // demo users act as the creators so creation-audit queries have data to show
  const users = await Meteor.users.find({}, { fields: { name: 1, createdAt: 1 } }).fetchAsync();

  const clientNames = [
    'Telior AS',
    'Nautica AS',
    'Arktik Invest AS',
    'Broadwell LLC',
    'Conterion Solar GmbH',
    'Swedish Timber AB',
    'Aeon Communication Inc',
    'Municipality of Greenwich',
    'Horizon Machinery GmbH',
    'Idena Architecture PLC',
    'Quantic Inc',
    'Morrison Engineering LLC',
    'Norton Systems AB',
    'Telavia Aeronautical Engineering AB',
    'Wilkinson Maynes LLP',
    'Finbank AB',
    'Vircom AG',
    'Gilleon Services PLC',
    'SMB Construction LLC',
    'Keitoberg LTD',
    'Finelia OY',
    'Fractal Telecommunication LLC',
    'Abertel GmbH',
    'Wells Acetel AB',
    'Weston AB',
    'Atelion Inc',
    'Atelmar Finance LLC',
    'Charlton Milling AB',
    'Sapetel Studios AB',
    'Davedon Retail AB',
    'AMS Hotels AB',
    'VXN Telemedia OY',
    'Martel GmbH',
    'Arpetel Logistics AS',
    'Valtratel AS',
    'Rekitel GmbH',
    'PMC Electronics LLC',
    'Altel Manufacturing and Retail AB',
    'Xenimex Entertainment Inc',
    'Indelex Systems AB',
  ];

  const windowStartMs = Date.now() - DEMO_PERIOD_DAYS * DAY_MS;

  for (const clientName of clientNames) {
    // most clients are long-standing (created up to a year before the demo
    // activity window), the rest are onboarded during the window so "new
    // client" questions see a genuine ramp-up from the creation date; never
    // before the creator's own account
    const creator = users[Math.floor(Math.random() * users.length)];
    const preWindow = Math.random() < 0.6;
    const rangeStart = preWindow ? windowStartMs - 365 * DAY_MS : windowStartMs;
    const rangeEnd = preWindow ? windowStartMs : Date.now();
    const earliest = Math.max(rangeStart, creator.createdAt.getTime());
    const createdAt = new Date(earliest + Math.floor(Math.random() * Math.max(0, rangeEnd - earliest)));
    const doc = {
      _id: Random.id(),
      name: clientName,
      nameNormalized: normalizeStringForAC(clientName),
      reminder: '',
      createdAt,
      createdBy: { id: creator._id, name: creator.name },
      modifiedAt: createdAt,
      modifiedBy: { id: creator._id, name: creator.name },
    };
    docs.push(doc);
  }
  await Clients.rawCollection().insertMany(docs);
};
