/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import coreGetClientForEdit from '/src/server/core/getClientForEdit.js';
import coreClientSave from '/src/server/core/clientSave.js';
import coreClientDelete from '/src/server/core/clientDelete.js';

Meteor.methods({
  async getClientForEdit(clientId) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreGetClientForEdit(user, clientId);
  },
  async clientSave(client) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreClientSave(user, client);
  },
  async clientDelete(clientId) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreClientDelete(user, clientId);
  },
});
