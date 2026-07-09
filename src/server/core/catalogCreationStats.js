/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Clients, Projects } from '/src/shared/collections/collections.js';

dayjs.extend(utc);

const RECORDS_CAP = 200;

const inputSchema = z.object({
  entity: z.enum(['clients', 'projects', 'users']),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
  includeRecords: z.boolean().optional(),
})
  .refine(d => !(d.createdAfter && d.createdBefore && d.createdBefore < d.createdAfter), { message: 'createdBefore must not be before createdAfter' });

// Creation-audit aggregation over the catalog entities (Clients, Projects,
// Users): who created how many, and when, computed server-side so callers
// never have to scan and tally raw list arrays.
export default async function catalogCreationStats(user, args) {
  const parsed = inputSchema.safeParse(args);
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);
  const { entity, createdAfter, createdBefore, includeRecords } = parsed.data;

  if ((entity === 'clients' || entity === 'projects') && !user.permissions.catalog) throw new Meteor.Error('403', 'No permission to access catalog');

  const query = {};
  if (createdAfter || createdBefore) {
    query.createdAt = {};
    if (createdAfter) query.createdAt.$gte = createdAfter;
    if (createdBefore) query.createdAt.$lte = createdBefore;
  }

  let docs;
  if (entity === 'clients') {
    docs = await Clients.find(query, { fields: { name: 1, createdAt: 1, createdBy: 1 }, sort: { createdAt: -1 } }).fetchAsync();
  } else if (entity === 'projects') {
    docs = await Projects.find(query, { fields: { name: 1, clientId: 1, createdAt: 1, createdBy: 1 }, sort: { createdAt: -1 } }).fetchAsync();
  } else {
    docs = await Meteor.users.find(query, { fields: { name: 1, createdAt: 1, createdBy: 1, disabled: 1 }, sort: { createdAt: -1 } }).fetchAsync();
  }

  const byCreatorMap = new Map();
  const byMonthMap = new Map();
  for (const doc of docs) {
    const creatorId = doc.createdBy?.id ?? null;
    let creator = byCreatorMap.get(creatorId);
    if (!creator) {
      creator = { creatorId, creatorName: doc.createdBy?.name ?? null, count: 0 };
      byCreatorMap.set(creatorId, creator);
    }
    creator.count += 1;
    if (doc.createdAt) {
      const month = dayjs.utc(doc.createdAt).format('YYYY-MM');
      byMonthMap.set(month, (byMonthMap.get(month) || 0) + 1);
    }
  }

  const byCreator = [...byCreatorMap.values()].sort((a, b) => b.count - a.count || String(a.creatorName).localeCompare(String(b.creatorName)));
  const byMonth = [...byMonthMap.entries()].map(([month, count]) => ({ month, count })).sort((a, b) => a.month.localeCompare(b.month));

  const meta = { entity };
  if (createdAfter) meta.createdAfter = createdAfter;
  if (createdBefore) meta.createdBefore = createdBefore;
  meta.notes = 'Counts cover all matching records (exact at any scale). byMonth months with no creations are omitted (read as zero).';
  if (entity === 'users') meta.notes += ' Disabled users are included; each record carries a disabled flag when set.';

  const result = { total: docs.length, byCreator, byMonth, meta };

  if (includeRecords) {
    const slice = docs.slice(0, RECORDS_CAP);
    let clientsById = new Map();
    if (entity === 'projects') {
      const clientDocs = await Clients.find({ _id: { $in: [...new Set(slice.map(p => p.clientId))] } }, { fields: { name: 1 } }).fetchAsync();
      clientsById = new Map(clientDocs.map(c => [c._id, c.name]));
    }
    result.records = slice.map(doc => ({
      id: doc._id,
      name: doc.name,
      createdAt: doc.createdAt,
      createdBy: doc.createdBy ?? null,
      ...(entity === 'projects' ? { clientId: doc.clientId, clientName: clientsById.get(doc.clientId) ?? null } : {}),
      ...(entity === 'users' && doc.disabled ? { disabled: true } : {}),
    }));
    result.moreRecords = docs.length > RECORDS_CAP;
  }

  return result;
}
