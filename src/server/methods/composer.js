/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import coreComposerAll from '/src/server/core/composerAll.js';
import coreComposerTagColor from '/src/server/core/composerTagColor.js';
import coreComposerTagText from '/src/server/core/composerTagText.js';
import coreComposerExporter from '/src/server/core/composerExporter.js';

Meteor.methods({
  async composerAll(searchTerms) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreComposerAll(user, searchTerms);
  },
  async composerTagColor(selTimes, color) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreComposerTagColor(user, selTimes, color);
  },
  async composerTagText(selTimes, text) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreComposerTagText(user, selTimes, text);
  },
  async composerExporter(args) {
    if (!this.userId) throw new Meteor.Error('401', 'User not logged in');
    const user = await Meteor.users.findOneAsync(this.userId);
    return await coreComposerExporter(user, args);
  },
});
