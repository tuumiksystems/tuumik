/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import { Tenants } from '/src/shared/collections/collections.js';
import { appVersion } from '/src/shared/utils/app.js';
import { fetch } from 'meteor/fetch';

const inputSchema = z.object({
  exporterId: z.string(),
  exportOptions: z.object({}).passthrough(),
  times: z.array(z.unknown()),
  meta: z.object({}).passthrough(),
});

export default async function composerExporter(user, args) {
  if (!user.permissions.composer) throw new Meteor.Error('403', 'No permission to access composer');
  const parsed = inputSchema.safeParse(args);
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  const tenant = await Tenants.findOneAsync(user.tenantId);
  const { composerExportersBack } = tenant;
  const exporter = composerExportersBack.find(x => x.id === args.exporterId);

  if (!exporter) throw new Meteor.Error('403', 'No exporter function found');

  // convert dates to timestamps
  const times2 = args.times.map(time => {
    const timestamp = time.date instanceof Date ? time.date.getTime() : time.date;
    const timeObj = time;
    timeObj.date = timestamp;
    return timeObj;
  });

  const meta2 = args.meta;
  meta2.period.start = meta2.period.start instanceof Date ? meta2.period.start.getTime() : meta2.period.start;
  meta2.period.end = meta2.period.end instanceof Date ? meta2.period.end.getTime() : meta2.period.end;
  // /convert dates to timestamps

  const body = {
    exportOptions: args.exportOptions,
    times: times2,
    meta: meta2,
    user: {
      name: user.name,
    },
    tenant: {
      name: tenant.name,
      dateFormat: tenant.dateFormat,
      timeFormat: tenant.timeFormat,
      thouMark: tenant.thouMark,
      decimalMark: tenant.decimalMark,
      currency: tenant.currency,
    },
    app: {
      version: appVersion,
    },
  };
  const opts = {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', 'x-api-key': exporter.apiKey },
  };
  try {
    const res = await fetch(exporter.url, opts);
    if (res.status === 403) throw new Meteor.Error('403', 'Invalid API key used for export');
    if (!res.ok) throw new Meteor.Error('500', 'Unable to export data');
    const data = await res.json();
    return data;
  } catch (err) {
    if (err.error === '403') throw new Meteor.Error('403', 'Invalid API key used for export');
    throw new Meteor.Error('500', 'Unable to export data');
  }
}
