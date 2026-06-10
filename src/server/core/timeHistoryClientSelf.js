/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Times, Projects } from '/src/shared/collections/collections.js';

const inputSchema = z.object({
  timeId: z.string(),
  clientId: z.string(),
  limit: z.number().int().max(200, 'Query limit exceeded'),
});

export default async function timeHistoryClientSelf(user, timeId, clientId, limit) {
  const parsed = inputSchema.safeParse({ timeId, clientId, limit });
  if (!parsed.success) throw new Meteor.Error('100', parsed.error.issues[0].message);

  const clientProjects = await Projects.find({ tenantId: user.tenantId, clientId }).fetchAsync();
  const allProjectIds = clientProjects.map(project => project._id);

  const timesRes = await Times.find(
    {
      tenantId: user.tenantId,
      owner: user._id,
      projectId: { $in: allProjectIds },
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
  const projectsRes = await Projects.find({ tenantId: user.tenantId, _id: { $in: projectIds } }, { fields: { name: 1 } }).fetchAsync();
  const timesWithProjectsJoined = timesRes.map(time => {
    const x = time;
    const projectDoc = projectsRes.find(project => project._id === time.projectId);
    if (projectDoc?.name) x.projectName = projectDoc.name;
    return x;
  });
  // /join projects

  return timesWithProjectsJoined;
}
