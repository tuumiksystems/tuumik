/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Times, Projects } from '/src/shared/collections/collections.js';

export default async function timeClearProject(user, timeId) {
  const curTime = await Times.findOneAsync({ _id: timeId, owner: user._id });
  const curProject = await Projects.findOneAsync({ _id: curTime.projectId });
  const { clientId } = curProject;

  const query = { _id: timeId, owner: user._id };
  if (Meteor.isServer) query.tenantId = user.tenantId;
  await Times.updateAsync(query, { $unset: { projectId: '' }, $set: { clientId, lastModified: new Date() } });
}
