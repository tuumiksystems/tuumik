/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Tenants } from '/src/shared/collections/collections.js';
import { isValidEmailAddress } from '/src/server/utils/validation';

export default async function mainSettingsSave(user, settings) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access main settings');

  if (!isValidEmailAddress(settings.email)) throw new Meteor.Error('405', 'Unrecognized email format');

  if (settings.dateFormat !== 'DD.MM.YYYY' && settings.dateFormat !== 'MM.DD.YYYY' && settings.dateFormat !== 'YYYY.MM.DD') {
    throw new Meteor.Error('405', 'Unrecognised date format');
  }

  if (settings.timeFormat !== 'HH:mm' && settings.timeFormat !== 'h:mm A') throw new Meteor.Error('405', 'Unrecognised time format');
  if (settings.thouMark !== 'comma' && settings.thouMark !== 'space') throw new Meteor.Error('405', 'Unrecognised thousands separator');
  if (settings.decimalMark !== 'period' && settings.decimalMark !== 'comma') throw new Meteor.Error('405', 'Unrecognised decimal separator');
  if (settings.thouMark === settings.decimalMark) throw new Meteor.Error('405', 'Thousands and decimal separators must be different');

  if (settings.trackerStep !== 1 && settings.trackerStep !== 6 && settings.trackerStep !== 12 && settings.trackerStep !== 15 && settings.trackerStep !== 30) {
    throw new Meteor.Error('405', 'Unrecognised tracker step');
  }

  await Tenants.updateAsync(
    { _id: user.tenantId },
    {
      $set: {
        name: settings.name,
        email: settings.email,
        phone: settings.phone,
        currency: {
          str: settings.currency.str,
          sign: settings.currency.sign,
        },
        dateFormat: settings.dateFormat,
        timeFormat: settings.timeFormat,
        weekStart: settings.weekStart,
        thouMark: settings.thouMark,
        decimalMark: settings.decimalMark,
        useTaskTypesByDefault: settings.useTaskTypesByDefault,
        trackerStep: settings.trackerStep,
      },
    },
  );
}
