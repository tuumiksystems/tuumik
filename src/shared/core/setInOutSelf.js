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
  const updater = { id: user._id, name: user.name };

  const setObj = {
    inOutUpdateById: user._id,
    inOutUpdateByName: user.name,
  };

  if (board.status !== undefined) setObj.inOutStatus = board.status;
  if (board.note !== undefined) setObj.inOutNote = board.note;
  if (board.eta !== undefined) setObj.inOutETA = board.eta;

  // consolidate changes done in quick succession (set status, then note, then eta, fix
  // wording, ...) into a single status period: while the current period is younger than
  // this, changes only modify the live fields on the user doc and no Statuses document
  // is created, so the whole burst is archived later as one document; inOutUpdateAt
  // stays anchored at the period start and inOutUpdaters collects everyone who edited
  // the board during the period
  const recentPeriodSeconds = 180;
  const periodIsRecent = user.inOutUpdateAt && dayjs.utc(dateNow).diff(dayjs.utc(user.inOutUpdateAt), 'second') < recentPeriodSeconds;

  if (periodIsRecent) {
    await Meteor.users.updateAsync(
      { _id: user._id },
      { $set: setObj, $addToSet: { inOutUpdaters: updater } },
    );
    return;
  }

  // the current period is old enough to keep: start a new period and archive the old
  // one, i.e. save the user's status that existed until this update into a Statuses
  // collection document
  setObj.inOutUpdateAt = dateNow;
  setObj.inOutUpdaters = [updater];

  await Meteor.users.updateAsync(
    { _id: user._id },
    { $set: setObj },
  );

  // work and statusText are stamped from the option being archived, so history
  // keeps the meaning the status had when recorded even if the option is later
  // edited or deleted, and aggregations can match on work without a join
  const archivedOption = tenant.inOutOptions.find(opt => opt.id === user.inOutStatus);

  await Statuses.insertAsync({
    userId: user._id,
    start: user.inOutUpdateAt,
    end: dateNow,
    status: user.inOutStatus,
    statusText: archivedOption?.text || '',
    work: !!archivedOption?.work,
    note: user.inOutNote,
    eta: user.inOutETA,
    tz,
    updaters: user.inOutUpdaters || [],
  });
}
