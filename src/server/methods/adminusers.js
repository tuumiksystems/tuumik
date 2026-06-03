/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import coreUsersList from '/src/server/core/usersList.js';
import coreGetUserForEdit from '/src/server/core/getUserForEdit.js';
import coreAddUser from '/src/server/core/addUser.js';
import coreSaveUserGeneral from '/src/server/core/saveUserGeneral.js';
import coreSaveUserUsername from '/src/server/core/saveUserUsername.js';
import coreSaveUserPassword from '/src/server/core/saveUserPassword.js';
import coreAddUserEmail from '/src/server/core/addUserEmail.js';
import coreRemoveUserEmail from '/src/server/core/removeUserEmail.js';
import coreSendVerifyEmail from '/src/server/core/sendVerifyEmail.js';
import coreRemoveUser from '/src/server/core/removeUser.js';
import coreDisableUser from '/src/server/core/disableUser.js';
import coreEnableUser from '/src/server/core/enableUser.js';

Meteor.methods({
  async usersList() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreUsersList(user);
  },
  async getUserForEdit(userId) {
    check(userId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreGetUserForEdit(user, userId);
  },
  async addUser(name, email, password) {
    check(name, String);
    check(email, String);
    check(password, Object);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAddUser(user, name, email, password);
  },
  async saveUserGeneral(editedUser) {
    check(editedUser, Object);
    check(editedUser._id, String);
    check(editedUser.name, String);
    check(editedUser.pic, String);
    check(editedUser.permissions, Object);
    check(editedUser.trackerSimple, Boolean);
    check(editedUser.defaultClientId, String);
    check(editedUser.defaultProjectId, String);
    check(editedUser.inOutShow, Boolean);
    check(editedUser.inTeams, [String]);
    check(editedUser.apiKeyCreation, Boolean);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreSaveUserGeneral(user, editedUser);
  },
  async saveUserUsername(userId, username) {
    check(userId, String);
    check(username, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreSaveUserUsername(user, userId, username);
  },
  async saveUserPassword(userId, password) {
    check(userId, String);
    check(password, Object);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreSaveUserPassword(user, userId, password);
  },
  async addUserEmail(userId, email) {
    check(userId, String);
    check(email, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAddUserEmail(user, userId, email);
  },
  async removeUserEmail(userId, email) {
    check(userId, String);
    check(email, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreRemoveUserEmail(user, userId, email);
  },
  async sendVerifyEmail(userId, email) {
    check(userId, String);
    check(email, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreSendVerifyEmail(user, userId, email);
  },
  async removeUser(userId) {
    check(userId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreRemoveUser(user, userId);
  },
  async disableUser(userId) {
    check(userId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreDisableUser(user, userId);
  },
  async enableUser(userId) {
    check(userId, String);
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreEnableUser(user, userId);
  },
});
