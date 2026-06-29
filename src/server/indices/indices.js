/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { TaskGroups, Times, Statuses, Clients, Projects } from '/src/shared/collections/collections.js';

export default function() {
  Meteor.users.rawCollection().createIndex({ nameNormalized: 1 });
  Meteor.users.rawCollection().createIndex({ 'apiKeys.id': 1 }, { unique: true, sparse: true });

  Times.rawCollection().createIndex({ date: 1, owner: 1 });
  Times.rawCollection().createIndex({ taskDescNormalized: 1 });

  Statuses.rawCollection().createIndex({ start: 1, userId: 1 });

  Clients.rawCollection().createIndex({ nameNormalized: 1 });

  Projects.rawCollection().createIndex({ nameNormalized: 1 });
}
