/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Times, Projects, Clients } from '/src/shared/collections/collections.js';

const inputSchema = z.object({
  timeId: z.string(),
  limit: z.number().int().max(200, 'Query limit exceeded'),
});

export default async function timeHistoryClearSelf(user, timeId, limit) {
  const parsed = inputSchema.safeParse({ timeId, limit });
  if (!parsed.success) throw new Meteor.Error('100', parsed.error.issues[0].message);

  const timesRes = await Times.find(
    {
      tenantId: user.tenantId,
      owner: user._id,
      projectId: { $exists: true },
      hideHistory: { $ne: true },
      _id: { $ne: timeId },
    },
    {
      fields: {
        date: 1,
        startMinute: 1,
        endMinute: 1,
        taskType: 1,
        taskDesc: 1,
        projectId: 1,
        useTaskType: 1,
        lastModified: 1,
      },
      sort: { date: -1, lastModified: -1 },
      limit,
    },
  ).fetchAsync();

  // join projects
  const projectIds = [...new Set(timesRes.map(time => time.projectId))].sort();
  const projectsRes = await Projects.find({ tenantId: user.tenantId, _id: { $in: projectIds } }, { fields: { name: 1, clientId: 1 } }).fetchAsync();
  const timesWithProjectsJoined = timesRes.map(time => {
    const x = time;
    const projectDoc = projectsRes.find(project => project._id === time.projectId);
    if (projectDoc?.name) x.projectName = projectDoc.name;
    if (projectDoc?.clientId) x.clientId = projectDoc.clientId;
    return x;
  });
  // /join projects

  // join clients
  const clientIds = [...new Set(timesWithProjectsJoined.map(time => time.clientId))].sort();
  const clientsRes = await Clients.find({ tenantId: user.tenantId, _id: { $in: clientIds } }, { fields: { name: 1 } }).fetchAsync();
  const timesWithClientsJoined = timesRes.map(time => {
    const x = time;
    const clientDoc = clientsRes.find(client => client._id === time.clientId);
    if (clientDoc?.name) x.clientName = clientDoc.name;
    if (x.clientId) x.clientId = null;
    return x;
  });
  // /join clients

  return timesWithClientsJoined;
}
