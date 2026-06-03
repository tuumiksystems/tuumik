/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Global } from '/src/shared/collections/collections.js';

export default async function loadSignupSettings() {
  const global = await Global.findOneAsync();
  return {
    allowSignup: global.allowSignup,
    requireSignupCode: !!global.signupCode,
  };
}
