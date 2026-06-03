/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Projects } from '/src/shared/collections/collections.js';

export default async function getProjectsForClientView(user, clientId) {
  const projectsRes = await Projects.find(
    { tenantId: user.tenantId, clientId },
    {
      fields: { name: 1, created: 1 },
      sort: { created: 1 },
    },
  ).fetchAsync();

  return { projects: projectsRes };
}
