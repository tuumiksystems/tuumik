/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Times, Tenants, Projects } from '/src/shared/collections/collections.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

const inputSchema = z.object({
  selDate: z.date().refine(
    d => d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0 && d.getUTCMilliseconds() === 1,
    { message: 'Incorrect date format' },
  ),
  startMinute: z.number().int().min(0, 'Incorrect start minute').max(1440, 'Incorrect start minute'),
  endMinute: z.number().int().min(1, 'Incorrect end minute').max(1440, 'Incorrect end minute').optional(),
  taskType: z.string().optional(),
  taskDesc: z.string().max(500, 'Task description length limit exceeded').optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  hideHistory: z.boolean().optional(),
  intCom: z.string().max(500, 'Internal comment length limit exceeded').optional(),
});

export default async function timeInsert(user, args) {
  const { selDate, startMinute, endMinute, taskType, taskDesc, clientId, projectId, hideHistory, intCom } = args;
  const parsed = inputSchema.safeParse(args);
  if (!parsed.success) throw new Meteor.Error('403', parsed.error.issues[0].message);

  const tenant = await Tenants.findOneAsync(user.tenantId);
  const { trackerStep } = tenant;
  const step = trackerStep === 1 || trackerStep === 6 ? 18 : trackerStep;
  const autoEndMinute = startMinute < 1440 - step - 1 ? startMinute + step : 1440;

  const doc = {
    date: selDate,
    owner: user._id,
    startMinute,
    endMinute: endMinute !== undefined ? endMinute : autoEndMinute,
    plan: false,
    tagColor: '',
    tagText: '',
    lastModified: new Date(),
  };

  if (tenant?.useTaskTypesByDefault) doc.useTaskType = true;

  if (projectId !== undefined) {
    doc.projectId = projectId;
    if (Meteor.isServer) {
      const selProject = await Projects.findOneAsync({ _id: projectId });
      if (selProject?.useTaskTypes) doc.useTaskType = true;
      else delete doc.useTaskType;
    }
  } else if (clientId !== undefined) {
    doc.clientId = clientId;
  } else if (user.defaultProjectId) {
    doc.projectId = user.defaultProjectId;
  } else if (user.defaultClientId) {
    doc.clientId = user.defaultClientId;
  }

  if (taskType !== undefined) doc.taskType = taskType;
  if (taskDesc !== undefined) {
    doc.taskDesc = taskDesc;
    doc.taskDescNormalized = normalizeStringForAC(taskDesc);
  }
  if (intCom !== undefined) doc.intCom = intCom;
  if (hideHistory) doc.hideHistory = hideHistory;

  if (Meteor.isServer) doc.tenantId = user.tenantId;

  const timeId = await Times.insertAsync(doc);
  return { timeId };
}
