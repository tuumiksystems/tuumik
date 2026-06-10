/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Times, Clients, Projects, Tenants } from '/src/shared/collections/collections.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

const inputSchema = z.object({
  projectPickers: z.array(z.object({}).passthrough()),
  searchUsers: z.array(z.string()),
  period: z.object({
    start: z.date().nullable().optional(),
    end: z.date().nullable().optional(),
  }),
  taskDesc: z.string().optional(),
  tagColor: z.object({}).passthrough(),
  tagText: z.string().optional(),
  sort: z.object({
    first: z.string(),
    second: z.string(),
    third: z.string(),
  }),
  limit: z.union([z.number(), z.string()]),
});

export default async function composerAll(user, searchTerms) {
  if (!user.permissions.composer) throw new Meteor.Error('403', 'No permission to access composer');
  const parsed = inputSchema.safeParse(searchTerms);
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const tenant = await Tenants.findOneAsync(user.tenantId);
  const { currency, composerExportersFront } = tenant;

  const query = { tenantId: user.tenantId };
  const meta = {};

  if (searchTerms.projectPickers.length) {
    const projectIds = [];
    for (const x of searchTerms.projectPickers) {
      if (x.projectId) {
        projectIds.push(x.projectId);
      } else if (x.clientId) {
        const projects = await Projects.find({
          tenantId: user.tenantId,
          clientId: x.clientId,
        }).fetchAsync();
        for (const p of projects) projectIds.push(p._id);
      }
    }
    const projectIdsUnique = [...new Set(projectIds)];
    query.projectId = { $in: projectIdsUnique };

    const metaProjects = await Projects.find(
      {
        tenantId: user.tenantId,
        _id: { $in: projectIdsUnique },
      },
      { fields: { name: 1, clientId: 1 }, sort: { name: 1 } },
    ).fetchAsync();
    const clientIds = [];
    for (const p of metaProjects) clientIds.push(p.clientId);
    const clientIdsUnique = [...new Set(clientIds)];
    const metaClients = await Clients.find(
      {
        tenantId: user.tenantId,
        _id: { $in: clientIdsUnique },
      },
      { fields: { name: 1 }, sort: { name: 1 } },
    ).fetchAsync();
    const metaClientsWithProjects = metaClients.map(client => {
      const x = { name: client.name, projects: [] };
      for (const p of metaProjects) {
        if (p.clientId === client._id) x.projects.push({ name: p.name });
      }
      return x;
    });
    meta.clients = metaClientsWithProjects;
  }

  if (searchTerms.searchUsers.length) {
    const userIds = searchTerms.searchUsers;
    const userIdsUnique = [...new Set(userIds)];
    query.owner = { $in: userIdsUnique };
    meta.users = await Meteor.users.find({ tenantId: user.tenantId, _id: { $in: userIdsUnique } }, { fields: { name: 1 }, sort: { name: 1 } }).fetchAsync();
  }

  if (searchTerms.period.start || searchTerms.period.end) {
    const startDate = searchTerms.period.start;
    const endDate = searchTerms.period.end;
    const dateQuery = {};
    if (startDate) dateQuery.$gt = startDate;
    if (endDate) dateQuery.$lt = endDate;
    query.date = dateQuery;
    meta.period = searchTerms.period;
  }

  if (searchTerms.taskDesc) {
    const str = searchTerms.taskDesc;
    const escaped = str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const normalized = normalizeStringForAC(escaped);
    const searchQuery = new RegExp(normalized);
    query.taskDescNormalized = searchQuery;
    meta.taskDesc = searchTerms.taskDesc;
  }

  const tc = searchTerms.tagColor;
  if (tc.green || tc.yellow || tc.red || tc.grey || tc.clear) {
    const colors = [];
    if (tc.green) colors.push('green');
    if (tc.yellow) colors.push('yellow');
    if (tc.red) colors.push('red');
    if (tc.grey) colors.push('grey');
    if (tc.clear) colors.push('');
    query.tagColor = { $in: colors };
    meta.tagColor = searchTerms.tagColor;
  }

  if (searchTerms.tagText) {
    query.tagText = searchTerms.tagText;
    meta.tagText = searchTerms.tagText;
  }

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
  meta.sort = searchTerms.sort;

  let limit = Number.parseInt(searchTerms.limit) || 1000;
  if (Meteor.settings.public.composerLimit && limit > Meteor.settings.public.composerLimit) limit = Meteor.settings.public.composerLimit;
  meta.limit = limit;

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
    },
    sort,
    limit,
  }).fetchAsync();

  // join owners for times
  const ownerIds1 = [...new Set(timesRes.map(time => time.owner))].sort();
  const ownersRes1 = await Meteor.users.find({ tenantId: user.tenantId, _id: { $in: ownerIds1 } }, { fields: { name: 1 } }).fetchAsync();
  const timesWithOwnersJoined = timesRes.map(time => {
    const x = time;
    const ownerDoc = ownersRes1.find(owner => owner._id === time.owner);
    if (ownerDoc?.name) x.ownerName = ownerDoc.name;
    return x;
  });
  // /join owners for times

  // join projects for times
  const projectIds1 = [...new Set(timesWithOwnersJoined.map(time => time.projectId))].sort();
  const projectsRes1 = await Projects.find({ tenantId: user.tenantId, _id: { $in: projectIds1 } }, { fields: { name: 1, clientId: 1 } }).fetchAsync();
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
  const clientsRes1 = await Clients.find({ tenantId: user.tenantId, _id: { $in: clientIds1 } }, { fields: { name: 1 } }).fetchAsync();
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
    currency,
    composerExportersFront,
  };
}
