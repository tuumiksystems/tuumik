/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

// Each permission name maps 1:1 to the core function (or endpoint action) an API
// route calls. For the handful of PATCH routes in times.js that dispatch to
// multiple core functions depending on the request body, a single descriptive
// permission name covers the whole endpoint (timeEditTiming, timeEditProject,
// timeEditClient, timeEditTask).
//
// Public endpoints that require no authentication at all (POST /api/demo,
// GET /api/signup/settings, POST /api/signup, POST /api/signup/reset-password)
// are not listed here because no role check applies to them.

// ─── Read-only, non-admin ────────────────────────────────────────────────────

const REGULAR_READ_ONLY_PERMISSIONS = [
  // Autocomplete
  'autocompleteClients',
  'autocompleteProjects',
  'autocompleteUsers',

  // Catalog
  'catalogClients',
  'catalogProjectsForClient',

  // Clients (read)
  'clientHistory',
  'getClientForView',
  'getProjectsForClientView',
  'getTimesForClientView',

  // Composer (POST but purely a query/export – no data is mutated)
  'composerAll',
  'composerExporter',

  // Monitors
  'teamMonitorLoad',
  'userMonitorLoad',

  // Projects (read)
  'projectHistory',
  'getProjectForView',
  'getTimesForProjectView',

  // Project picker
  'pickClientInProjectPicker',
  'pickProjectInProjectPicker',

  // Task groups (user-facing read)
  'getTaskGroups',

  // Times (read)
  'loadRecentTimes',
  'timeHistoryClearSelf',
  'timeHistoryProjectSelf',
  'timeHistoryProjectOthers',
  'timeHistoryClientSelf',
  'timeHistoryClientOthers',
  'timeHistorySearch',

  // User settings – self (read)
  'getApiKeysSelf',
  'getUserAndTenantSelf',
];

// ─── Write operations, non-admin ─────────────────────────────────────────────

const REGULAR_WRITE_PERMISSIONS = [
  // Clients (write)
  'clientInsert',
  'clientSave',
  'clientDelete',

  // Composer (write)
  'composerTagColor',
  'composerTagText',

  // In/Out – self
  'setInOutStatusSelf',
  'setInOutNoteSelf',
  'setInOutETASelf',

  // In/Out – others
  'setInOutStatusOthers',
  'setInOutNoteOthers',
  'setInOutETAOthers',

  // Projects (write)
  'projectInsert',
  'projectSave',
  'projectDelete',

  // Times (write)
  'timeInsert',
  'timeInsertCopy',
  'timeRemove',
  'timeSetPlan',
  'timeEditTiming',   // PATCH /api/times/:id/timing  (move / resize / startAndEnd)
  'timeEditProject',  // PATCH /api/times/:id/project (setProject / clearProject / clearAll)
  'timeEditClient',   // PATCH /api/times/:id/client  (setClient / clearClient)
  'timeEditTask',     // PATCH /api/times/:id/task    (taskDesc / taskType / intCom / hideHistory)
  'timeFillData',
  'timeSetDate',

  // User settings – self (write)
  'createApiKeySelf',
  'removeApiKeySelf',
  'resendEmailVerificationLink',
];

// ─── Admin-only ───────────────────────────────────────────────────────────────

const ADMIN_PERMISSIONS = [
  // Exporters
  'loadExporters',
  'saveExporters',

  // In/Out options
  'loadInOutOptions',
  'saveInOutOptions',

  // Main settings
  'mainSettingsLoad',
  'mainSettingsSave',

  // Task groups (admin management)
  'loadTaskGroups',
  'insertTaskGroup',
  'loadTaskGroupForEdit',
  'saveTaskGroup',
  'deleteTaskGroup',

  // Teams
  'loadTeams',
  'saveTeams',

  // Tenant
  'terminateTenant',

  // Users
  'usersList',
  'addUser',
  'getUserForEdit',
  'saveUserGeneral',
  'saveUserUsername',
  'saveUserPassword',
  'addUserEmail',
  'removeUserEmail',
  'sendVerifyEmail',
  'removeUser',
  'disableUser',
  'enableUser',
];

// ─── Role definitions ─────────────────────────────────────────────────────────

export const roles = [
  {
    id: 'regularReadOnly',
    allowed: [
      ...REGULAR_READ_ONLY_PERMISSIONS,
    ],
  },
  {
    id: 'regularReadWrite',
    allowed: [
      ...REGULAR_READ_ONLY_PERMISSIONS,
      ...REGULAR_WRITE_PERMISSIONS,
    ],
  },
  {
    id: 'admin',
    allowed: [
      ...REGULAR_READ_ONLY_PERMISSIONS,
      ...REGULAR_WRITE_PERMISSIONS,
      ...ADMIN_PERMISSIONS,
    ],
  },
];
