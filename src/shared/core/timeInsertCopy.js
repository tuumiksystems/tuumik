/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Times, Tenant } from '/src/shared/collections/collections.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

const inputSchema = z.object({
  sourceTimeId: z.string(),
  startMinute: z.number().int().min(0, 'Incorrect start minute').max(1440, 'Incorrect start minute'),
});

export default async function timeInsertCopy(user, sourceTimeId, startMinute) {
  const parsed = inputSchema.safeParse({ sourceTimeId, startMinute });
  if (!parsed.success) throw new Meteor.Error('403', parsed.error.issues[0].message);

  const tenant = await Tenant.findOneAsync();
  const { trackerStep } = tenant;
  const step = trackerStep === 1 ? 6 : trackerStep;
  const endMinute = startMinute < 1440 - step - 1 ? startMinute + step : 1440;

  const sourceTime = await Times.findOneAsync({ _id: sourceTimeId, owner: user._id });
  if (!sourceTime) throw new Meteor.Error('404', 'No source time found');

  const doc = {
    date: sourceTime.date,
    owner: user._id,
    startMinute,
    endMinute,
    plan: false,
    tagColor: '',
    tagText: '',
    tz: user.timezone || tenant?.defaultTimezone || 'UTC',
    createdAt: new Date(),
    createdBy: { id: user._id, name: user.name },
    modifiedAt: new Date(),
    modifiedBy: { id: user._id, name: user.name },
  };

  if (sourceTime.useTaskType) doc.useTaskType = sourceTime.useTaskType;
  if (sourceTime.clientId) doc.clientId = sourceTime.clientId;
  if (sourceTime.projectId) doc.projectId = sourceTime.projectId;
  if (sourceTime.taskType) doc.taskType = sourceTime.taskType;
  if (sourceTime.taskDesc) {
    doc.taskDesc = sourceTime.taskDesc;
    doc.taskDescNormalized = normalizeStringForAC(sourceTime.taskDesc);
  }
  if (sourceTime.hideHistory) doc.hideHistory = sourceTime.hideHistory;
  if (sourceTime.intCom) doc.intCom = sourceTime.intCom;

  await Times.insertAsync(doc);
}
