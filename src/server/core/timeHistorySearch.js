/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Times, Projects, Clients } from '/src/shared/collections/collections.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

const inputSchema = z.object({
  taskDesc: z.string(),
  owner: z.string(),
  scope: z.string(),
  projectId: z.string().nullable().optional(),
  clientId: z.string().nullable().optional(),
  sort: z.string(),
  limit: z.number().int().max(200, 'Query limit exceeded'),
});

export default async function timeHistorySearch(user, taskDesc, owner, scope, projectId, clientId, sort, limit) {
  const parsed = inputSchema.safeParse({ taskDesc, owner, scope, projectId, clientId, sort, limit });
  if (!parsed.success) throw new Meteor.Error('100', parsed.error.issues[0].message);

  const escaped = taskDesc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const normalized = normalizeStringForAC(escaped);
  const searchQuery = new RegExp(normalized);

  const queryObj = {
    tenantId: user.tenantId,
    taskDescNormalized: searchQuery,
    hideHistory: { $ne: true },
  };

  // target owners
  if (owner === 'me') {
    queryObj.owner = user._id;
  } else if (owner === 'others') {
    if (!user.permissions.historyOthers) throw new Meteor.Error('100', 'No permission to view task history of other users');
    queryObj.owner = { $ne: user._id };
  } else if (!user.permissions.historyOthers) {
    throw new Meteor.Error('100', 'No permission to view task history of other users');
  }

  // target projects
  if (scope === 'selectedProject') {
    queryObj.projectId = projectId;
  } else if (scope === 'clientProjects') {
    const clientProjects = await Projects.find({ tenantId: user.tenantId, clientId }).fetchAsync();
    const projectIds = clientProjects.map(clientProject => clientProject._id);
    queryObj.projectId = { $in: projectIds };
  } else {
    queryObj.projectId = { $exists: true };
  }

  // sort
  const sortObj = sort === 'dte' ? { date: -1, lastModified: -1 } : { lastModified: -1, date: -1 };

  const timesRes = await Times.find(queryObj, {
    fields: {
      date: 1,
      owner: 1,
      startMinute: 1,
      endMinute: 1,
      taskType: 1,
      taskDesc: 1,
      projectId: 1,
      useTaskType: 1,
      lastModified: 1,
    },
    sort: sortObj,
    limit,
  }).fetchAsync();

  // join projects and owners
  const projectIds = [...new Set(timesRes.map(time => time.projectId))].sort();
  const projectsRes = await Projects.find({ tenantId: user.tenantId, _id: { $in: projectIds } }, { fields: { name: 1, clientId: 1 } }).fetchAsync();
  const ownerIds = [...new Set(timesRes.map(time => time.owner))].sort();
  const ownersRes = await Meteor.users.find({ tenantId: user.tenantId, _id: { $in: ownerIds } }, { fields: { name: 1 } }).fetchAsync();
  const timesWithProjectsAndOwnersJoined = timesRes.map(time => {
    const x = time;
    const projectDoc = projectsRes.find(project => project._id === time.projectId);
    if (projectDoc?.name) x.projectName = projectDoc.name;
    if (projectDoc?.clientId) x.clientId = projectDoc.clientId;
    const ownerDoc = ownersRes.find(ownr => ownr._id === time.owner);
    if (ownerDoc?.name) x.ownerName = ownerDoc.name;
    return x;
  });
  // /join projects and owners

  // join clients
  const clientIds = [...new Set(timesWithProjectsAndOwnersJoined.map(time => time.clientId))].sort();
  const clientsRes = await Clients.find({ tenantId: user.tenantId, _id: { $in: clientIds } }, { fields: { name: 1 } }).fetchAsync();
  const timesWithAllJoins = timesWithProjectsAndOwnersJoined.map(time => {
    const x = time;
    const clientDoc = clientsRes.find(client => client._id === time.clientId);
    if (clientDoc?.name) x.clientName = clientDoc.name;
    if (x.clientId) x.clientId = null;
    return x;
  });
  // /join clients

  return timesWithAllJoins;
}
