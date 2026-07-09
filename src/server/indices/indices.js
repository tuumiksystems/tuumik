/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { TaskGroups, Times, Statuses, Clients, Projects, OauthClients, OauthCodes, OauthGrants } from '/src/shared/collections/collections.js';

export default function() {
  Meteor.users.rawCollection().createIndex({ nameNormalized: 1 });
  Meteor.users.rawCollection().createIndex({ 'apiKeys.id': 1 }, { unique: true, sparse: true });

  Times.rawCollection().createIndex({ date: 1, owner: 1 });
  Times.rawCollection().createIndex({ taskDescNormalized: 1 });
  Times.rawCollection().createIndex({ owner: 1, date: 1 });
  Times.rawCollection().createIndex({ projectId: 1, date: 1 });
  Times.rawCollection().createIndex({ clientId: 1, date: 1 });

  Statuses.rawCollection().createIndex({ start: 1, userId: 1 });
  Statuses.rawCollection().createIndex({ userId: 1, start: 1 });
  Statuses.rawCollection().createIndex({ end: 1 });

  Clients.rawCollection().createIndex({ nameNormalized: 1 });
  Clients.rawCollection().createIndex({ createdAt: 1 });

  Projects.rawCollection().createIndex({ nameNormalized: 1 });
  Projects.rawCollection().createIndex({ createdAt: 1 });

  OauthClients.rawCollection().createIndex({ clientId: 1 }, { unique: true });

  OauthCodes.rawCollection().createIndex({ codeId: 1 }, { unique: true });
  OauthCodes.rawCollection().createIndex({ expires: 1 }, { expireAfterSeconds: 0 });

  OauthGrants.rawCollection().createIndex({ accessTokenId: 1 }, { unique: true });
  OauthGrants.rawCollection().createIndex({ refreshTokenId: 1 }, { unique: true });
  OauthGrants.rawCollection().createIndex({ userId: 1 });
}
