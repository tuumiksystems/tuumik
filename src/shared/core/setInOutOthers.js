/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Tenants, Statuses } from '/src/shared/collections/collections.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const inputSchema = z.object({
  targetUserId: z.string(),
  board: z.object({
    status: z.string().optional(),
    note: z.string().optional(),
    eta: z.string().optional(),
  }).passthrough(),
});

export default async function setInOutOthers(user, targetUserId, board) {
  if (user._id !== targetUserId && !user.permissions.inOutEditOthers) throw new Meteor.Error('403', 'No permission to edit in/out');
  const parsed = inputSchema.safeParse({ targetUserId, board });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const targetUser = await Meteor.users.findOneAsync(targetUserId);
  if (!targetUser) throw new Meteor.Error('404', 'Target user not found');

  if (board.status !== undefined) {
    const tenant = await Tenants.findOneAsync(user.tenantId);
    if (!tenant.inOutOptions.find(opt => opt.id === board.status)) throw new Meteor.Error('400', 'Unrecognized in/out status');
  }

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
    { tenantId: user.tenantId, _id: targetUserId },
    { $set: setObj },
  );

  // save the user's status that existed until this update into a Statuses collection document
  const recentPeriodSeconds = 180;
  const recentStart = dayjs.utc(dateNow).subtract(recentPeriodSeconds, 'seconds').toDate();
  const recentEnd = dateNow;

  const recentStatus = await Statuses.findOneAsync(
    {
      tenantId: user.tenantId,
      userId: user._id,
      start: { $gt: recentStart, $lt: recentEnd },
    },
    { fields: { userId: 1 } },
  );
  if (recentStatus) {
    // if a status document was just created a moment ago, update it rather than creating a new one
    // purpose here is to consolidate updates that are done in quick succession into a single document
    await Statuses.updateAsync(
      { tenantId: user.tenantId, _id: recentStatus._id },
      {
        $set: {
          end: dateNow,
          status: targetUser.inOutStatus,
          note: targetUser.inOutNote,
          eta: targetUser.inOutETA,
        },
        $addToSet: {
          updaters: { id: targetUser.inOutUpdateById, name: targetUser.inOutUpdateByName },
        },
      },
    );
  } else {
    // if there is no recent enough status document, create a new one
    await Statuses.insertAsync({
      tenantId: user.tenantId,
      userId: targetUser._id,
      start: targetUser.inOutUpdateAt,
      end: dateNow,
      status: targetUser.inOutStatus,
      note: targetUser.inOutNote,
      eta: targetUser.inOutETA,
      updaters: [{ id: targetUser.inOutUpdateById, name: targetUser.inOutUpdateByName }],
    });
  }
}
