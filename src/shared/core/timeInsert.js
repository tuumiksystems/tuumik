/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Times, Tenants } from '/src/shared/collections/collections.js';

export default async function timeInsert(user, selDate, startMinute) {
  if (startMinute < 0 || startMinute > 1440 || !Number.isInteger(startMinute)) throw new Meteor.Error('403', 'Incorrect start minute');
  if (selDate.getUTCHours() !== 0 || selDate.getUTCMinutes() !== 0 || selDate.getUTCSeconds() !== 0 || selDate.getUTCMilliseconds() !== 1) {
    throw new Meteor.Error('403', 'Incorrect date format');
  }

  const tenant = await Tenants.findOneAsync(user.tenantId);
  const { trackerStep } = tenant;
  const step = trackerStep === 1 || trackerStep === 6 ? 18 : trackerStep;
  const endMinute = startMinute < 1440 - step - 1 ? startMinute + step : 1440;

  const doc = {
    date: selDate,
    owner: user._id,
    startMinute,
    endMinute,
    plan: false,
    tagColor: '',
    tagText: '',
    lastModified: new Date(),
  };

  if (tenant?.useTaskTypesByDefault) doc.useTaskType = true;

  if (user.defaultProjectId) {
    doc.projectId = user.defaultProjectId;
  } else if (user.defaultClientId) {
    doc.clientId = user.defaultClientId;
  }

  if (Meteor.isServer) doc.tenantId = user.tenantId;

  const timeId = await Times.insertAsync(doc);
  return { timeId };
}
