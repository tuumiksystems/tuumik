/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import normalizeStringForAC from '/src/shared/utils/normalization.js';

export default async function saveUserGeneral(user, editedUser) {
  if (!user.permissions.admin) throw new Meteor.Error('403', 'No permission to edit users');

  const targetUser = await Meteor.users.findOneAsync({ _id: editedUser._id });
  if (user.tenantId !== targetUser.tenantId) throw new Meteor.Error('403', 'Incorrect tenant');

  const { permissions } = editedUser;
  const perms = {
    timeTracker: !!permissions.timeTracker,
    historyOthers: !!permissions.historyOthers,
    monitor: !!permissions.monitor,
    clientsEdit: !!permissions.clientsEdit,
    projectsEdit: !!permissions.projectsEdit,
    catalog: !!permissions.catalog,
    composer: !!permissions.composer,
    inOutSelf: !!permissions.inOutSelf,
    inOutView: !!permissions.inOutView,
    inOutEditOthers: !!permissions.inOutEditOthers,
    admin: !!permissions.admin,
  };

  if (user._id === targetUser._id && !perms.admin) {
    throw new Meteor.Error('403', 'User cannot remove admin from itself');
  }

  await Meteor.users.updateAsync(
    { tenantId: user.tenantId, _id: editedUser._id },
    {
      $set: {
        name: editedUser.name,
        nameNormalized: normalizeStringForAC(editedUser.name),
        pic: editedUser.pic,
        permissions: perms,
        trackerSimple: editedUser.trackerSimple,
        defaultClientId: editedUser.defaultClientId,
        defaultProjectId: editedUser.defaultProjectId,
        inOutShow: editedUser.inOutShow,
        inTeams: editedUser.inTeams,
        apiKeyCreation: editedUser.apiKeyCreation,
      },
    },
  );
}
