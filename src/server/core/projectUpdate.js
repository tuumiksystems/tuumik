/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Projects } from '/src/shared/collections/collections.js';
import projectEdit from '/src/server/integrations/project-edit.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

const inputSchema = z.object({
  _id: z.string(),
  name: z.string().min(2, 'Project name must be at least 2 characters').optional(),
  clientId: z.string().optional(),
  taskGroupIds: z.array(z.string()).optional(),
  useTaskTypes: z.boolean().optional(),
  reminder: z.string().optional(),
});

export default async function projectUpdate(user, project) {
  if (!user.permissions.projectsEdit) throw new Meteor.Error('403', 'No permission to modify project data');
  const parsed = inputSchema.safeParse(project);
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const setObj = { lastModified: new Date() };
  if (project.name !== undefined) {
    setObj.name = project.name;
    setObj.nameNormalized = normalizeStringForAC(project.name);
  }
  if (project.clientId !== undefined) setObj.clientId = project.clientId;
  if (project.taskGroupIds !== undefined) setObj.taskGroupIds = project.taskGroupIds;
  if (project.useTaskTypes !== undefined) setObj.useTaskTypes = project.useTaskTypes;
  if (project.reminder !== undefined) setObj.reminder = project.reminder;

  await Projects.updateAsync({ _id: project._id }, { $set: setObj });
  projectEdit({ project });
}
