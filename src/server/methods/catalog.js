/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import coreCatalogClients from '/src/server/core/catalogClients.js';
import coreCatalogProjectsForClient from '/src/server/core/catalogProjectsForClient.js';

Meteor.methods({
  async catalogClients() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreCatalogClients(user);
  },
  async catalogProjectsForClient(clientId) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreCatalogProjectsForClient(user, clientId);
  },
});
