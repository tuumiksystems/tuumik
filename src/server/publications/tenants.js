/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Tenant } from '/src/shared/collections/collections.js';

Meteor.publish('tenant', function() {
  if (!this.userId) {
    return this.ready();
  }

  return Tenant.find(
    {},
    {
      fields: {
        name: 1,
        numberFormat: 1,
        dateFormat: 1,
        timeFormat: 1,
        defaultTimezone: 1,
        weekStart: 1,
        thouMark: 1,
        decimalMark: 1,
        currency: 1,
        useTaskTypesByDefault: 1,
        trackerStep: 1,
        teams: 1,
        composerExportersFront: 1,
        homeView: 1,
        inOutOptions: 1,
      },
    },
  );
});
