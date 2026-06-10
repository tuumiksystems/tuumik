/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Times, Projects } from '/src/shared/collections/collections.js';

const inputSchema = z.object({
  timeId: z.string(),
  projectId: z.string(),
});

export default async function timeProjectId(user, timeId, projectId) {
  const parsed = inputSchema.safeParse({ timeId, projectId });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const selProject = await Projects.findOneAsync({ _id: projectId });
  if (Meteor.isServer && !selProject) throw new Meteor.Error('404', 'Cannot find selected project');

  const unsetObj = { clientId: '' };
  const setObj = { projectId, lastModified: new Date() };

  if (Meteor.isServer && selProject.useTaskTypes) {
    setObj.useTaskType = true;
  } else {
    unsetObj.useTaskType = '';
  }

  const query = { _id: timeId, owner: user._id };
  if (Meteor.isServer) query.tenantId = user.tenantId;
  await Times.updateAsync(query, { $unset: unsetObj, $set: setObj });
}
