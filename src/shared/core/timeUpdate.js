/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Times, Projects } from '/src/shared/collections/collections.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

const updatableFields = ['selDate', 'startMinute', 'endMinute', 'taskType', 'taskDesc', 'clientId', 'projectId', 'hideHistory', 'intCom', 'plan', 'move', 'clearProject', 'clearAll'];

const inputSchema = z.object({
  selDate: z.date().refine(
    d => d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0 && d.getUTCMilliseconds() === 1,
    { message: 'Incorrect date format' },
  ).optional(),
  startMinute: z.number().int().min(0, 'Incorrect start minute').max(1440, 'Incorrect start minute').optional(),
  endMinute: z.number().int().min(1, 'Incorrect end minute').max(1440, 'Incorrect end minute').optional(),
  taskType: z.string().optional(),
  taskDesc: z.string().max(500, 'Task description length limit exceeded').optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  hideHistory: z.boolean().optional(),
  intCom: z.string().max(500, 'Internal comment length limit exceeded').optional(),
  plan: z.boolean().optional(),
  move: z.boolean().optional(),
  clearProject: z.boolean().optional(),
  clearAll: z.boolean().optional(),
})
  .refine(data => updatableFields.some(field => data[field] !== undefined), { message: 'At least one field must be provided' })
  .refine(data => !data.move || data.startMinute !== undefined, { message: 'move requires startMinute', path: ['startMinute'] })
  .refine(data => data.move || data.startMinute === undefined || data.endMinute === undefined || data.endMinute >= data.startMinute, {
    message: 'End must be after start',
    path: ['endMinute'],
  });

export default async function timeUpdate(user, timeId, args) {
  const parsed = inputSchema.safeParse(args);
  if (!parsed.success) throw new Meteor.Error('403', parsed.error.issues[0].message);

  const { selDate, startMinute, endMinute, taskType, taskDesc, clientId, projectId, hideHistory, intCom, plan, move, clearProject, clearAll } = args;

  const setObj = { modifiedAt: new Date(), modifiedBy: { id: user._id, name: user.name } };
  const unsetObj = {};

  if (selDate !== undefined) setObj.date = selDate;
  if (taskType !== undefined) setObj.taskType = taskType;
  if (taskDesc !== undefined) {
    setObj.taskDesc = taskDesc;
    setObj.taskDescNormalized = normalizeStringForAC(taskDesc);
  }
  if (intCom !== undefined) setObj.intCom = intCom;
  if (plan !== undefined) setObj.plan = plan;

  if (hideHistory !== undefined) {
    if (hideHistory) setObj.hideHistory = true;
    else unsetObj.hideHistory = '';
  }

  // Timing: with move, shift the entry to startMinute while preserving its
  // duration (mirrors timeMove); otherwise set whatever bounds are provided.
  if (move && startMinute !== undefined) {
    const currentTime = await Times.findOneAsync({ _id: timeId, owner: user._id });
    setObj.startMinute = startMinute;
    setObj.endMinute = startMinute + currentTime.endMinute - currentTime.startMinute;
  } else {
    if (startMinute !== undefined) setObj.startMinute = startMinute;
    if (endMinute !== undefined) setObj.endMinute = endMinute;
  }

  // Project / client. Clearing takes precedence over assignment, and assigning
  // a project takes precedence over assigning a standalone client.
  if (clearAll) {
    unsetObj.projectId = '';
    unsetObj.clientId = '';
  } else if (clearProject) {
    const curTime = await Times.findOneAsync({ _id: timeId, owner: user._id });
    const curProject = await Projects.findOneAsync({ _id: curTime.projectId });
    setObj.clientId = curProject.clientId;
    unsetObj.projectId = '';
  } else if (projectId !== undefined) {
    const selProject = await Projects.findOneAsync({ _id: projectId });
    if (Meteor.isServer && !selProject) throw new Meteor.Error('404', 'Cannot find selected project');
    setObj.projectId = projectId;
    if (selProject?.clientId) setObj.clientId = selProject.clientId;
    if (Meteor.isServer && selProject.useTaskTypes) setObj.useTaskType = true;
    else unsetObj.useTaskType = '';
  } else if (clientId !== undefined) {
    setObj.clientId = clientId;
    unsetObj.projectId = '';
  }

  const modifier = { $set: setObj };
  if (Object.keys(unsetObj).length > 0) modifier.$unset = unsetObj;

  const query = { _id: timeId, owner: user._id };
  await Times.updateAsync(query, modifier);

  return { timeId };
}
