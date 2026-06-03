/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { TaskGroups } from '/src/shared/collections/collections.js';

export default async function getTaskGroups(user) {
  const taskGroupsRes = await TaskGroups.find(
    { tenantId: user.tenantId },
    {
      fields: { name: 1, position: 1, showByDefault: 1, types: 1 },
      sort: { position: 1 },
    },
  ).fetchAsync();

  return taskGroupsRes;
}
