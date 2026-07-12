/* Copyright (C) 2026 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { z } from 'zod';

const inputSchema = z.object({
  aiInstructions: z.string().max(2000, 'AI instructions must not exceed 2000 characters'),
});

export default async function saveAiSettingsSelf(user, settings) {
  const parsed = inputSchema.safeParse(settings);
  if (!parsed.success) throw new Meteor.Error('400', parsed.error.issues[0].message);

  await Meteor.users.updateAsync(
    { _id: user._id },
    {
      $set: {
        aiInstructions: settings.aiInstructions,
      },
    },
  );
}
