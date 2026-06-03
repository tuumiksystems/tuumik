/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import coreSetInOutStatusSelf from '/src/shared/core/setInOutStatusSelf.js';
import coreSetInOutStatusOthers from '/src/shared/core/setInOutStatusOthers.js';
import coreSetInOutNoteSelf from '/src/shared/core/setInOutNoteSelf.js';
import coreSetInOutNoteOthers from '/src/shared/core/setInOutNoteOthers.js';
import coreSetInOutETASelf from '/src/shared/core/setInOutETASelf.js';
import coreSetInOutETAOthers from '/src/shared/core/setInOutETAOthers.js';

Meteor.methods({
  async setInOutStatusSelf(status) {
    check(status, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreSetInOutStatusSelf(user, status);
  },
  async setInOutStatusOthers(targetUserId, status) {
    check(status, String);
    check(targetUserId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreSetInOutStatusOthers(user, targetUserId, status);
  },
  async setInOutNoteSelf(note) {
    check(note, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreSetInOutNoteSelf(user, note);
  },
  async setInOutNoteOthers(targetUserId, note) {
    check(note, String);
    check(targetUserId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreSetInOutNoteOthers(user, targetUserId, note);
  },
  async setInOutETASelf(note) {
    check(note, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreSetInOutETASelf(user, note);
  },
  async setInOutETAOthers(targetUserId, note) {
    check(note, String);
    check(targetUserId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreSetInOutETAOthers(user, targetUserId, note);
  },
});
