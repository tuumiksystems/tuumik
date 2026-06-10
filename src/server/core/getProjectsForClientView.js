/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { z } from 'zod';
import { Projects } from '/src/shared/collections/collections.js';

const inputSchema = z.object({
  clientId: z.string(),
});

export default async function getProjectsForClientView(user, clientId) {
  const parsed = inputSchema.safeParse({ clientId });
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);

  const projectsRes = await Projects.find(
    { tenantId: user.tenantId, clientId },
    {
      fields: { name: 1, created: 1 },
      sort: { created: 1 },
    },
  ).fetchAsync();

  return { projects: projectsRes };
}
