/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Times } from '/src/shared/collections/collections.js';

export default async function timeIntCom(user, timeId, intCom) {
  if (intCom.length > 500) throw new Meteor.Error('403', 'Internal comment length limit exceeded');

  const query = { _id: timeId, owner: user._id };
  if (Meteor.isServer) query.tenantId = user.tenantId;
  await Times.updateAsync(query, { $set: { intCom, lastModified: new Date() } });
}
