/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { Meteor } from 'meteor/meteor';
import { Projects, Times } from '/src/shared/collections/collections.js';
import projectDelete from '/src/server/integrations/project-delete.js';

export default async function projectDeleteFn(user, projectId) {
  if (!user.permissions.projectsEdit) throw new Meteor.Error('403', 'No permission to access project data');

  const time = await Times.findOneAsync({ projectId });
  if (time) throw new Meteor.Error('405', 'Cannot delete project since it has time entries');

  await Meteor.users.updateAsync({ defaultProjectId: projectId }, { $set: { defaultProjectId: '' } });
  await Projects.removeAsync({ tenantId: user.tenantId, _id: projectId });
  projectDelete({ projectId });
}
