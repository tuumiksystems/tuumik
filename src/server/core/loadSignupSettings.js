/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Tenant } from '/src/shared/collections/collections.js';

export default async function loadSignupSettings() {
  const tenant = await Tenant.findOneAsync();
  return {
    allowSignup: !tenant,
  };
}
