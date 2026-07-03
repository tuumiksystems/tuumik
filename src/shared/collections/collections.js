/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Mongo } from 'meteor/mongo';

export const Tenant = new Mongo.Collection('tenant');
export const TaskGroups = new Mongo.Collection('task-groups');
export const Times = new Mongo.Collection('times');
export const Clients = new Mongo.Collection('clients');
export const Projects = new Mongo.Collection('projects');
export const Statuses = new Mongo.Collection('statuses');
export const OauthClients = new Mongo.Collection('oauth-clients');
export const OauthCodes = new Mongo.Collection('oauth-codes');
export const OauthGrants = new Mongo.Collection('oauth-grants');
