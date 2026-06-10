/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import coreAdminUsersList from '/src/server/core/adminUsersList.js';
import coreAdminGetUserForEdit from '/src/server/core/adminGetUserForEdit.js';
import coreAdminAddUser from '/src/server/core/adminAddUser.js';
import coreAdminSaveUserGeneral from '/src/server/core/adminSaveUserGeneral.js';
import coreAdminSaveUserUsername from '/src/server/core/adminSaveUserUsername.js';
import coreAdminSaveUserPassword from '/src/server/core/adminSaveUserPassword.js';
import coreAdminAddUserEmail from '/src/server/core/adminAddUserEmail.js';
import coreAdminRemoveUserEmail from '/src/server/core/adminRemoveUserEmail.js';
import coreAdminSendVerifyEmail from '/src/server/core/adminSendVerifyEmail.js';
import coreAdminRemoveUser from '/src/server/core/adminRemoveUser.js';
import coreAdminDisableUser from '/src/server/core/adminDisableUser.js';
import coreAdminEnableUser from '/src/server/core/adminEnableUser.js';

Meteor.methods({
  async usersList() {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminUsersList(user);
  },
  async getUserForEdit(userId) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminGetUserForEdit(user, userId);
  },
  async addUser(name, email, password) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminAddUser(user, name, email, password);
  },
  async saveUserGeneral(editedUser) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminSaveUserGeneral(user, editedUser);
  },
  async saveUserUsername(userId, username) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminSaveUserUsername(user, userId, username);
  },
  async saveUserPassword(userId, password) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminSaveUserPassword(user, userId, password);
  },
  async addUserEmail(userId, email) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminAddUserEmail(user, userId, email);
  },
  async removeUserEmail(userId, email) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminRemoveUserEmail(user, userId, email);
  },
  async sendVerifyEmail(userId, email) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminSendVerifyEmail(user, userId, email);
  },
  async removeUser(userId) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminRemoveUser(user, userId);
  },
  async disableUser(userId) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminDisableUser(user, userId);
  },
  async enableUser(userId) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreAdminEnableUser(user, userId);
  },
});
