/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import coreAutocompleteClients from '/src/server/core/autocompleteClients.js';
import coreAutocompleteProjects from '/src/server/core/autocompleteProjects.js';
import coreAutocompleteUsers from '/src/server/core/autocompleteUsers.js';

Meteor.methods({
  async autocompleteClients(searchString) {
    check(searchString, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAutocompleteClients(user, searchString);
  },
  async autocompleteProjects(searchString) {
    check(searchString, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAutocompleteProjects(user, searchString);
  },
  async autocompleteUsers(searchString) {
    check(searchString, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAutocompleteUsers(user, searchString);
  },
});
