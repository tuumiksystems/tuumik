/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Tenant } from '/src/shared/collections/collections.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputSchema = z.object({
  name: z.string(),
  email: z.string().regex(EMAIL_REGEX, 'Unrecognized email format'),
  phone: z.string(),
  currency: z.object({ str: z.string(), sign: z.string() }),
  dateFormat: z.enum(['DD.MM.YYYY', 'MM.DD.YYYY', 'YYYY.MM.DD'], { message: 'Unrecognised date format' }),
  timeFormat: z.enum(['HH:mm', 'h:mm A'], { message: 'Unrecognised time format' }),
  defaultTimezone: z.string().min(1, 'Default timezone is required'),
  weekStart: z.string(),
  thouMark: z.enum(['comma', 'space'], { message: 'Unrecognised thousands separator' }),
  decimalMark: z.enum(['period', 'comma'], { message: 'Unrecognised decimal separator' }),
  useTaskTypesByDefault: z.boolean(),
  trackerStep: z.union(
    [z.literal(1), z.literal(6), z.literal(12), z.literal(15), z.literal(30)],
    { message: 'Unrecognised tracker step' },
  ),
}).refine(data => data.thouMark !== data.decimalMark, {
  message: 'Thousands and decimal separators must be different',
  path: ['decimalMark'],
});

export default async function adminMainSettingsSave(user, settings) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to access main settings');
  const parsed = inputSchema.safeParse(settings);
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  try {
    Intl.DateTimeFormat(undefined, { timeZone: settings.defaultTimezone });
  } catch (err) {
    throw new Meteor.Error('400', 'Unrecognized default timezone');
  }

  await Tenant.updateAsync(
    {},
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
        defaultTimezone: settings.defaultTimezone,
        weekStart: settings.weekStart,
        thouMark: settings.thouMark,
        decimalMark: settings.decimalMark,
        useTaskTypesByDefault: settings.useTaskTypesByDefault,
        trackerStep: settings.trackerStep,
      },
    },
  );
}
