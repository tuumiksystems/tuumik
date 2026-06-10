/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Times } from '/src/shared/collections/collections.js';

const inputSchema = z.object({
  timeId: z.string(),
  selDate: z.date().refine(
    d => d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0 && d.getUTCMilliseconds() === 1,
    { message: 'Incorrect date format' },
  ),
});

export default async function timeSetDate(user, timeId, selDate) {
  const parsed = inputSchema.safeParse({ timeId, selDate });
  if (!parsed.success) throw new Meteor.Error('403', parsed.error.issues[0].message);

  await Times.updateAsync(
    { tenantId: user.tenantId, _id: timeId, owner: user._id },
    { $set: { date: selDate, lastModified: new Date() } },
  );
}
