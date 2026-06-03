/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import coreTimeHistoryClearSelf from '/src/server/core/timeHistoryClearSelf.js';
import coreTimeHistoryProjectSelf from '/src/server/core/timeHistoryProjectSelf.js';
import coreTimeHistoryProjectOthers from '/src/server/core/timeHistoryProjectOthers.js';
import coreTimeHistoryClientSelf from '/src/server/core/timeHistoryClientSelf.js';
import coreTimeHistoryClientOthers from '/src/server/core/timeHistoryClientOthers.js';
import coreTimeHistorySearch from '/src/server/core/timeHistorySearch.js';
import coreTimeSetDate from '/src/server/core/timeSetDate.js';

Meteor.methods({
  async timeHistoryClearSelf(timeId, limit) {
    check(timeId, String);
    check(limit, Number);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTimeHistoryClearSelf(user, timeId, limit);
  },
  async timeHistoryProjectSelf(timeId, projectId, limit) {
    check(timeId, String);
    check(projectId, String);
    check(limit, Number);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTimeHistoryProjectSelf(user, timeId, projectId, limit);
  },
  async timeHistoryProjectOthers(projectId, limit) {
    check(projectId, String);
    check(limit, Number);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTimeHistoryProjectOthers(user, projectId, limit);
  },
  async timeHistoryClientSelf(timeId, clientId, limit) {
    check(timeId, String);
    check(clientId, String);
    check(limit, Number);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTimeHistoryClientSelf(user, timeId, clientId, limit);
  },
  async timeHistoryClientOthers(clientId, limit) {
    check(clientId, String);
    check(limit, Number);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTimeHistoryClientOthers(user, clientId, limit);
  },
  async timeHistorySearch(taskDesc, owner, scope, projectId, clientId, sort, limit) {
    check(taskDesc, String);
    check(owner, String);
    check(scope, String);
    check(projectId, Match.Maybe(String));
    check(clientId, Match.Maybe(String));
    check(sort, String);
    check(limit, Number);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTimeHistorySearch(user, taskDesc, owner, scope, projectId, clientId, sort, limit);
  },
  async timeSetDate(timeId, selDate) {
    check(timeId, String);
    check(selDate, Date);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTimeSetDate(user, timeId, selDate);
  },
});
