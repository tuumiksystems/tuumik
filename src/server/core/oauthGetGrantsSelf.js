/* Copyright (C) 2026 Tuumik Systems OÜ */

import { OauthGrants } from '/src/shared/collections/collections.js';

export default async function oauthGetGrantsSelf(user) {
  const grants = await OauthGrants.find(
    { userId: user._id },
    {
      fields: {
        clientName: 1,
        role: 1,
        scope: 1,
        refreshTokenExpires: 1,
        created: 1,
        lastUsed: 1,
      },
      sort: { created: -1 },
    },
  ).fetchAsync();

  return { grants };
}
