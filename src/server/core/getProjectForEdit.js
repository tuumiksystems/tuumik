/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Projects, Clients, TaskGroups } from '/src/shared/collections/collections.js';

const inputSchema = z.object({
  projectId: z.string(),
});

export default async function getProjectForEdit(user, projectId) {
  if (!user.permissions.projectsEdit) throw new Meteor.Error('403', 'No permission to access project data');
  const parsed = inputSchema.safeParse({ projectId });
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const projectRes = await Projects.findOneAsync(
    { tenantId: user.tenantId, _id: projectId },
    {
      fields: {
        name: 1,
        clientId: 1,
        taskGroupIds: 1,
        useTaskTypes: 1,
        reminder: 1,
        created: 1,
        createdBy: 1,
        lastModified: 1,
      },
    },
  );

  if (!projectRes) throw new Meteor.Error('404', 'Specified project not found');

  const clientRes = await Clients.findOneAsync({ tenantId: user.tenantId, _id: projectRes.clientId }, { fields: { name: 1 } });
  if (!clientRes) throw new Meteor.Error('500', 'Client for project not found');

  const taskGroupsRes = await TaskGroups.find({ tenantId: user.tenantId }, { fields: { name: 1, default: 1, types: 1 }, sort: { position: 1 } }).fetchAsync();

  return {
    project: { ...projectRes, clientName: clientRes.name },
    taskGroups: taskGroupsRes,
  };
}
