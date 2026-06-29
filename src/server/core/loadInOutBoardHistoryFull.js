/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Statuses, Tenant } from '/src/shared/collections/collections.js';

const inputSchema = z.object({
  userIds: z.array(z.string()).min(1),
  startLocal: z.date(),
  endLocal: z.date(),
}).refine(d => d.endLocal > d.startLocal, { message: 'endLocal must be after startLocal' });

export default async function loadInOutBoardHistoryFull(user, args) {
  const { userIds, startLocal, endLocal } = args;
  if (!user.permissions.inOutView) throw new Meteor.Error('403', 'No permission to view in/out board');

  const normalizedIds = Array.isArray(userIds) ? userIds : [userIds];

  const parsed = inputSchema.safeParse({ userIds: normalizedIds, startLocal, endLocal });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const tenant = await Tenant.findOneAsync();
  const { inOutOptions } = tenant;

  const limit = Meteor.settings.public.inOutHistoryLimit || 2000;

  const meta = {};
  meta.users = userIds;
  meta.period = { start: startLocal, end: endLocal };
  meta.limit = limit;

  const statusesRes = await Statuses.find(
    {
      $or: [
        { start: { $gt: startLocal, $lt: endLocal } },
        { end: { $gt: startLocal, $lt: endLocal } },
        { start: { $lt: startLocal }, end: { $gt: endLocal } },
      ],
      userId: { $in: normalizedIds },
    },
    {
      fields: {
        userId: 1,
        start: 1,
        end: 1,
        status: 1,
        note: 1,
        eta: 1,
        updaters: 1,
      },
      limit,
    },
  ).fetchAsync();

  const limitInfo = { limitReached: statusesRes.length >= limit, explanation: '' };
  if (limitInfo.limitReached) limitInfo.explanation = `Query limit was ${limit}, this was reached. Some results are likely omitted due to this. Consider making search terms narrower.`;

  // clamp statuses to the queried period
  for (const statusDoc of statusesRes) {
    const modifications = [];
    if (statusDoc.start < startLocal) {
      statusDoc.start = startLocal;
      modifications.push('start');
    }
    if (statusDoc.end && statusDoc.end > endLocal) {
      statusDoc.end = endLocal;
      modifications.push('end');
    }
    if (modifications.length) statusDoc.modified = `${modifications.join(' and ')} field${modifications.length > 1 ? 's' : ''} modified to fit inside query period`;
  }
  // /clamp statuses to the queried period

  // join options
  const statusesWithOptionsJoined = statusesRes.map(s => {
    const option = inOutOptions.find(opt => opt.id === s.status);
    return {
      ...s,
      text: option?.text,
      work: option?.work,
    };
  });
  // /join options

  return {
    statuses: statusesWithOptionsJoined,
    meta,
    limit: limitInfo,
    inOutOptions,
  };
}
