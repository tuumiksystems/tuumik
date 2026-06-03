/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import coreTimeInsert from '/src/shared/core/timeInsert.js';
import coreTimeInsertCopy from '/src/shared/core/timeInsertCopy.js';
import coreTimeRemove from '/src/shared/core/timeRemove.js';
import coreTimeSetPlan from '/src/shared/core/timeSetPlan.js';
import coreTimeResizeTop from '/src/shared/core/timeResizeTop.js';
import coreTimeResizeBottom from '/src/shared/core/timeResizeBottom.js';
import coreTimeStartAndEnd from '/src/shared/core/timeStartAndEnd.js';
import coreTimeMove from '/src/shared/core/timeMove.js';
import coreTimeClientId from '/src/shared/core/timeClientId.js';
import coreTimeProjectId from '/src/shared/core/timeProjectId.js';
import coreTimeClearClient from '/src/shared/core/timeClearClient.js';
import coreTimeClearProject from '/src/shared/core/timeClearProject.js';
import coreTimeTaskType from '/src/shared/core/timeTaskType.js';
import coreTimeTaskDesc from '/src/shared/core/timeTaskDesc.js';
import coreTimeIntCom from '/src/shared/core/timeIntCom.js';
import coreTimeHideHistory from '/src/shared/core/timeHideHistory.js';
import coreTimeFillData from '/src/shared/core/timeFillData.js';

Meteor.methods({
  async timeInsert(selDate, startMinute) {
    check(selDate, Date);
    check(startMinute, Number);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTimeInsert(user, selDate, startMinute);
  },
  async timeInsertCopy(sourceTimeId, startMinute) {
    check(sourceTimeId, String);
    check(startMinute, Number);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTimeInsertCopy(user, sourceTimeId, startMinute);
  },
  async timeRemove(timeId) {
    check(timeId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTimeRemove(user, timeId);
  },
  async timeSetPlan(timeId, plan) {
    check(timeId, String);
    check(plan, Boolean);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTimeSetPlan(user, timeId, plan);
  },
  async timeResizeTop(timeId, startMinute) {
    check(timeId, String);
    check(startMinute, Number);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTimeResizeTop(user, timeId, startMinute);
  },
  async timeResizeBottom(timeId, endMinute) {
    check(timeId, String);
    check(endMinute, Number);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTimeResizeBottom(user, timeId, endMinute);
  },
  async timeStartAndEnd(timeId, startMinute, endMinute) {
    check(timeId, String);
    check(startMinute, Number);
    check(endMinute, Number);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTimeStartAndEnd(user, timeId, startMinute, endMinute);
  },
  async timeMove(timeId, startMinute) {
    check(timeId, String);
    check(startMinute, Number);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTimeMove(user, timeId, startMinute);
  },
  async timeClientId(timeId, clientId) {
    check(timeId, String);
    check(clientId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTimeClientId(user, timeId, clientId);
  },
  async timeProjectId(timeId, projectId) {
    check(timeId, String);
    check(projectId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTimeProjectId(user, timeId, projectId);
  },
  async timeClearClient(timeId) {
    check(timeId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTimeClearClient(user, timeId);
  },
  async timeClearProject(timeId) {
    check(timeId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTimeClearProject(user, timeId);
  },
  async timeTaskType(timeId, taskType) {
    check(timeId, String);
    check(taskType, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTimeTaskType(user, timeId, taskType);
  },
  async timeTaskDesc(timeId, taskDesc) {
    check(timeId, String);
    check(taskDesc, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTimeTaskDesc(user, timeId, taskDesc);
  },
  async timeIntCom(timeId, intCom) {
    check(timeId, String);
    check(intCom, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTimeIntCom(user, timeId, intCom);
  },
  async timeHideHistory(timeId, hideHistory) {
    check(timeId, String);
    check(hideHistory, Boolean);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTimeHideHistory(user, timeId, hideHistory);
  },
  async timeFillData(timeId, projectId, taskType, taskDesc, useTaskType) {
    check(timeId, String);
    check(projectId, String);
    check(taskType, String);
    check(taskDesc, String);
    check(useTaskType, Boolean);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreTimeFillData(user, timeId, projectId, taskType, taskDesc, useTaskType);
  },
});
