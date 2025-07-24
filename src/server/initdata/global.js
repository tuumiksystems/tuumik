/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Global } from '/src/shared/collections/collections.js';

export default async () => {
  const globalDoc = await Global.findOneAsync();
  if (!globalDoc) {
    await Global.insertAsync({
      allowSignup: true,
      signupCode: '',
    });
  }
};
