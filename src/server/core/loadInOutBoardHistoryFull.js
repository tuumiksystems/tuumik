/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Statuses, Tenant } from '/src/shared/collections/collections.js';
import resolveUserAddressing from '/src/server/utils/resolveUserAddressing.js';

const inputSchema = z.object({
  userIds: z.array(z.string()).min(1).optional(),
  teamId: z.string().min(1).optional(),
  allUsers: z.boolean().optional(),
  startLocal: z.date(),
  endLocal: z.date(),
  skip: z.number().int().min(0).optional(),
  includeDetails: z.boolean().optional(),
})
  .refine(d => d.endLocal > d.startLocal, { message: 'endLocal must be after startLocal' })
  .refine(d => [d.userIds, d.teamId, d.allUsers].filter(Boolean).length === 1, { message: 'Provide exactly one of userIds, teamId or allUsers' });

export default async function loadInOutBoardHistoryFull(user, args) {
  const { userIds, teamId, allUsers, startLocal, endLocal } = args;
  if (!user.permissions.inOutView) throw new Meteor.Error('403', 'No permission to view in/out board');

  // only wrap a bare string when userIds was actually provided
  const normalizedIds = userIds == null || Array.isArray(userIds) ? userIds : [userIds];

  const parsed = inputSchema.safeParse({ ...args, userIds: normalizedIds });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const skip = args.skip || 0;
  // note/eta/updaters stay included by default for existing callers; API
  // clients that only need the timeline can drop them to shrink the payload
  const includeDetails = args.includeDetails !== false;

  const tenant = await Tenant.findOneAsync();
  const { inOutOptions } = tenant;

  const { users: resolvedUsers, userIds: resolvedUserIds, mode } = await resolveUserAddressing({ userIds: normalizedIds, teamId });

  const limit = Meteor.settings.public.inOutHistoryLimit || 2000;

  const meta = {};
  meta.users = resolvedUsers.map(u => ({ userId: u._id, name: u.name }));
  meta.addressing = teamId ? { mode, teamId } : { mode };
  meta.period = { start: startLocal, end: endLocal };
  meta.limit = limit;
  if (skip) meta.skip = skip;
  if (!includeDetails) meta.notes = 'note, eta and updaters fields are omitted (includeDetails is false).';

  if (!resolvedUserIds.length) {
    meta.explanation = 'No users matched the given addressing (empty team or unknown user ids)';
    return { statuses: [], meta, limit: { limitReached: false, explanation: '' }, hasMore: false, inOutOptions };
  }

  const statusesRes = await Statuses.find(
    {
      $or: [
        { start: { $gt: startLocal, $lt: endLocal } },
        { end: { $gt: startLocal, $lt: endLocal } },
        { start: { $lt: startLocal }, end: { $gt: endLocal } },
      ],
      userId: { $in: resolvedUserIds },
    },
    {
      fields: {
        userId: 1,
        start: 1,
        end: 1,
        status: 1,
        statusText: 1,
        work: 1,
        tz: 1,
        ...(includeDetails ? { note: 1, eta: 1, updaters: 1 } : {}),
      },
      // deterministic order so skip-based pagination is stable
      sort: { start: 1, _id: 1 },
      // one extra row distinguishes "exactly limit matches" from "more pages exist"
      limit: limit + 1,
      skip,
    },
  ).fetchAsync();

  const hasMore = statusesRes.length > limit;
  if (hasMore) statusesRes.length = limit;

  const limitInfo = { limitReached: hasMore, explanation: '' };
  if (hasMore) limitInfo.explanation = `Query limit was ${limit}, this was reached. Pass skip: ${skip + limit} to fetch the next page (sort order is stable), or make search terms narrower.`;

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

  // text and work come from the fields stamped onto each record when it was
  // written; the options join is only a fallback
  const statusesOut = statusesRes.map(s => {
    const option = inOutOptions.find(opt => opt.id === s.status);
    const { statusText, ...rest } = s;
    return {
      ...rest,
      text: statusText ?? option?.text,
      work: s.work ?? option?.work,
    };
  });

  return {
    statuses: statusesOut,
    meta,
    limit: limitInfo,
    hasMore,
    inOutOptions,
  };
}
