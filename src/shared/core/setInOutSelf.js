/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Tenant, Statuses } from '/src/shared/collections/collections.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const inputSchema = z.object({
  board: z.object({
    status: z.string().optional(),
    note: z.string().optional(),
    eta: z.union([z.date(), z.null()]).optional(),
  }).passthrough(),
});

export default async function setInOutSelf(user, board) {
  if (!user.permissions.inOutSelf) throw new Meteor.Error('403', 'No permission to edit in/out');
  const parsed = inputSchema.safeParse({ board });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const tenant = await Tenant.findOneAsync();
  if (board.status !== undefined) {
    if (!tenant.inOutOptions.find(opt => opt.id === board.status)) throw new Meteor.Error('400', 'Unrecognized in/out status');
  }

  // IANA tz this status is authored in, stored so each record is self-describing
  const tz = user.timezone || tenant?.defaultTimezone || 'UTC';

  const dateNow = new Date();

  const setObj = {
    inOutUpdateById: user._id,
    inOutUpdateByName: user.name,
    inOutUpdateAt: dateNow,
  };

  if (board.status !== undefined) setObj.inOutStatus = board.status;
  if (board.note !== undefined) setObj.inOutNote = board.note;
  if (board.eta !== undefined) setObj.inOutETA = board.eta;

  await Meteor.users.updateAsync(
    { _id: user._id },
    { $set: setObj },
  );

  // save the user's status that existed until this update into a Statuses collection document
  const recentPeriodSeconds = 180;
  const recentStart = dayjs.utc(dateNow).subtract(recentPeriodSeconds, 'seconds').toDate();
  const recentEnd = dateNow;

  const recentStatus = await Statuses.findOneAsync(
    {
      userId: user._id,
      start: { $gt: recentStart, $lt: recentEnd },
    },
    { fields: { userId: 1 } },
  );
  if (recentStatus) {
    // if a status document was just created a moment ago, update it rather than creating a new one
    // purpose here is to consolidate updates that are done in quick succession into a single document
    await Statuses.updateAsync(
      { _id: recentStatus._id },
      {
        $set: {
          end: dateNow,
          status: user.inOutStatus,
          note: user.inOutNote,
          eta: user.inOutETA,
          tz,
        },
        $addToSet: {
          updaters: { id: user.inOutUpdateById, name: user.inOutUpdateByName },
        },
      },
    );
  } else {
    // if there is no recent enough status document, create a new one
    await Statuses.insertAsync({
      userId: user._id,
      start: user.inOutUpdateAt,
      end: dateNow,
      status: user.inOutStatus,
      note: user.inOutNote,
      eta: user.inOutETA,
      tz,
      updaters: [{ id: user.inOutUpdateById, name: user.inOutUpdateByName }],
    });
  }
}
