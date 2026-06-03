/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Times, Tenants } from '/src/shared/collections/collections.js';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

export default async function timeInsertCopy(user, sourceTimeId, startMinute) {
  if (startMinute < 0 || startMinute > 1440 || !Number.isInteger(startMinute)) throw new Meteor.Error('403', 'Incorrect start minute');

  const tenant = await Tenants.findOneAsync(user.tenantId);
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
    lastModified: new Date(),
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
  if (Meteor.isServer) doc.tenantId = user.tenantId;

  await Times.insertAsync(doc);
}
