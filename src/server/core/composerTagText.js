/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Times } from '/src/shared/collections/collections.js';

export default async function composerTagText(user, selTimes, text) {
  if (!user.permissions.composer) throw new Meteor.Error('403', 'No permission to access composer');
  await Times.updateAsync({ tenantId: user.tenantId, _id: { $in: selTimes } }, { $set: { tagText: text, lastModified: new Date() } }, { multi: true });
}
