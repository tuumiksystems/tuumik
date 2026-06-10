/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Projects } from '/src/shared/collections/collections.js';
import projectEdit from '/src/server/integrations/project-edit.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

const inputSchema = z.object({
  _id: z.string(),
  name: z.string().min(2, 'Project name must be at least 2 characters'),
  clientId: z.string(),
  taskGroupIds: z.array(z.string()),
  useTaskTypes: z.boolean(),
  reminder: z.string(),
});

export default async function projectSave(user, project) {
  if (!user.permissions.projectsEdit) throw new Meteor.Error('403', 'No permission to modify project data');
  const parsed = inputSchema.safeParse(project);
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const projectId = project._id;
  const setObj = {};
  setObj.name = project.name;
  setObj.nameNormalized = normalizeStringForAC(project.name);
  setObj.clientId = project.clientId;
  setObj.taskGroupIds = project.taskGroupIds;
  setObj.useTaskTypes = project.useTaskTypes;
  setObj.reminder = project.reminder;
  setObj.lastModified = new Date();

  await Projects.updateAsync({ tenantId: user.tenantId, _id: projectId }, { $set: setObj });
  projectEdit({ project });
}
