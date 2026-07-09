/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Times, Clients, Projects } from '/src/shared/collections/collections.js';
import buildTimesQuery from '/src/server/utils/buildTimesQuery.js';

const inputSchema = z.object({
  projectPickers: z.array(z.object({}).passthrough()),
  searchUsers: z.array(z.string()),
  teamId: z.string().min(1).optional(),
  period: z.object({
    start: z.date(),
    end: z.date(),
  }).refine(d => d.end >= d.start, { message: 'period.end must not be before period.start' }),
  taskDesc: z.string().optional(),
  tagColor: z.object({}).passthrough(),
  tagText: z.string().optional(),
  plan: z.enum(['actual', 'planned', 'both']).optional(),
  overlapMinutes: z.object({
    from: z.number().int().min(0).max(1440),
    to: z.number().int().min(0).max(1440),
  }).refine(d => d.to > d.from, { message: 'overlapMinutes.to must be greater than overlapMinutes.from' }).optional(),
  minDurationMinutes: z.number().int().min(0).max(1440).optional(),
  maxDurationMinutes: z.number().int().min(0).max(1440).optional(),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).min(1).optional(),
  sort: z.object({
    first: z.string(),
    second: z.string(),
    third: z.string(),
  }),
  limit: z.union([z.number(), z.string()]).optional(),
  skip: z.union([z.number(), z.string()]).optional(),
}).refine(d => !(d.teamId && d.searchUsers.length), { message: 'Provide searchUsers or teamId, not both' });

export default async function timesheetExplorerFull(user, searchTerms) {
  if (!user.permissions.composer) throw new Meteor.Error('403', 'No permission to access composer');
  const parsed = inputSchema.safeParse(searchTerms);
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const { query, meta } = await buildTimesQuery(searchTerms);

  const sort = {};
  if (searchTerms.sort.first !== 'none') {
    if (searchTerms.sort.first === 'date') sort.date = 1;
    if (searchTerms.sort.first === 'project') sort.projectId = 1;
    if (searchTerms.sort.first === 'user') sort.owner = 1;
    if (searchTerms.sort.first === 'task') sort.taskDesc = 1;
    if (searchTerms.sort.first === 'tag-color') sort.tagColor = 1;
    if (searchTerms.sort.first === 'tag-text') sort.tagText = 1;
  }
  if (searchTerms.sort.second !== 'none') {
    if (searchTerms.sort.second === 'date') sort.date = 1;
    if (searchTerms.sort.second === 'project') sort.projectId = 1;
    if (searchTerms.sort.second === 'user') sort.owner = 1;
    if (searchTerms.sort.second === 'task') sort.taskDesc = 1;
    if (searchTerms.sort.second === 'tag-color') sort.tagColor = 1;
    if (searchTerms.sort.second === 'tag-text') sort.tagText = 1;
  }
  if (searchTerms.sort.third !== 'none') {
    if (searchTerms.sort.third === 'date') sort.date = 1;
    if (searchTerms.sort.third === 'project') sort.projectId = 1;
    if (searchTerms.sort.third === 'user') sort.owner = 1;
    if (searchTerms.sort.third === 'task') sort.taskDesc = 1;
    if (searchTerms.sort.third === 'tag-color') sort.tagColor = 1;
    if (searchTerms.sort.third === 'tag-text') sort.tagText = 1;
  }
  if (!Object.keys(sort).length) sort.date = 1;
  sort._id = 1; // deterministic tiebreaker so skip-based pagination is stable
  meta.sort = searchTerms.sort;

  let limit = Number.parseInt(searchTerms.limit) || 1000;
  if (Meteor.settings.public.timesheetExplorerLimit && limit > Meteor.settings.public.timesheetExplorerLimit) limit = Meteor.settings.public.timesheetExplorerLimit;
  meta.limit = limit;
  const skip = Number.parseInt(searchTerms.skip) || 0;
  if (skip) meta.skip = skip;

  if (meta.explanation) return { times: [], meta, limit: { limitReached: false, explanation: '' }, hasMore: false };

  const timesRes = await Times.find(query, {
    fields: {
      date: 1,
      owner: 1,
      startMinute: 1,
      endMinute: 1,
      clientId: 1,
      projectId: 1,
      taskType: 1,
      taskDesc: 1,
      useTaskType: 1,
      hideHistory: 1,
      intCom: 1,
      tagColor: 1,
      tagText: 1,
      createdAt: 1,
    },
    sort,
    // one extra row distinguishes "exactly limit matches" from "more pages exist"
    limit: limit + 1,
    skip,
  }).fetchAsync();

  const hasMore = timesRes.length > limit;
  if (hasMore) timesRes.length = limit;

  const limitInfo = { limitReached: hasMore, explanation: '' };
  if (hasMore) limitInfo.explanation = `Query limit was ${limit}, this was reached. Pass skip: ${skip + limit} to fetch the next page (sort order is stable), or make search terms narrower.`;

  // join owners for times
  const ownerIds1 = [...new Set(timesRes.map(time => time.owner))].sort();
  const ownersRes1 = await Meteor.users.find({ _id: { $in: ownerIds1 } }, { fields: { name: 1 } }).fetchAsync();
  const timesWithOwnersJoined = timesRes.map(time => {
    const x = time;
    const ownerDoc = ownersRes1.find(owner => owner._id === time.owner);
    if (ownerDoc?.name) x.ownerName = ownerDoc.name;
    return x;
  });
  // /join owners for times

  // join projects for times
  const projectIds1 = [...new Set(timesWithOwnersJoined.map(time => time.projectId))].sort();
  const projectsRes1 = await Projects.find({ _id: { $in: projectIds1 } }, { fields: { name: 1, clientId: 1 } }).fetchAsync();
  const timesWithProjectsJoined = timesRes.map(time => {
    const x = time;
    const projectDoc = projectsRes1.find(project => project._id === time.projectId);
    if (projectDoc?.name) x.projectName = projectDoc.name;
    if (projectDoc?.clientId) x.clientId = projectDoc.clientId;
    return x;
  });
  // /join projects for times

  // join clients for times
  const clientIds1 = [...new Set(timesWithProjectsJoined.map(time => time.clientId))].sort();
  const clientsRes1 = await Clients.find({ _id: { $in: clientIds1 } }, { fields: { name: 1 } }).fetchAsync();
  const timesWithClientsJoined = timesRes.map(time => {
    const x = time;
    const clientDoc = clientsRes1.find(client => client._id === time.clientId);
    if (clientDoc?.name) x.clientName = clientDoc.name;
    if (x.clientId) x.clientId = undefined;
    return x;
  });
  // /join clients for times

  return {
    times: timesWithClientsJoined,
    meta,
    limit: limitInfo,
    hasMore,
  };
}
