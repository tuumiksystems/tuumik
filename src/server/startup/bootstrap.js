/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import '/src/server/security/deny-allow-rules.js';

import '/src/server/accounts/accounts.js';
import '/src/server/accounts/email-templates.js';
import '/src/server/accounts/hook.js';

// publications
import '/src/server/publications/users.js';
import '/src/server/publications/tenants.js';
import '/src/server/publications/times.js';
import '/src/server/publications/clients.js';
import '/src/server/publications/projects.js';
import '/src/server/publications/inout.js';

// methods (server side)
import '/src/server/methods/general.js';
import '/src/server/methods/signup.js';
import '/src/server/methods/usersettings.js';
import '/src/server/methods/demodata.js';
import '/src/server/methods/autocomplete.js';
import '/src/server/methods/projectpicker.js';
import '/src/server/methods/timetracker.js';
import '/src/server/methods/taskgroups.js';
import '/src/server/methods/clientview.js';
import '/src/server/methods/clientadd.js';
import '/src/server/methods/clientedit.js';
import '/src/server/methods/projectview.js';
import '/src/server/methods/projectadd.js';
import '/src/server/methods/projectedit.js';
import '/src/server/methods/catalog.js';
import '/src/server/methods/composer.js';
import '/src/server/methods/inout.js';
import '/src/server/methods/teammonitor.js';
import '/src/server/methods/usermonitor.js';
import '/src/server/methods/recent.js';
import '/src/server/methods/users.js';

// methods (server side) (admin)
import '/src/server/methods/adminusers.js';
import '/src/server/methods/adminmainsettings.js';
import '/src/server/methods/admintaskgroups.js';
import '/src/server/methods/adminteams.js';
import '/src/server/methods/adminexporters.js';
import '/src/server/methods/admininoutoptions.js';
import '/src/server/methods/admintermination.js';

// methods (shared)
import '/src/shared/methods/timetracker.js';
import '/src/shared/methods/inout.js';

// api routes
import '/src/server/api/general.js';
import '/src/server/api/catalog.js';
import '/src/server/api/clientadd.js';
import '/src/server/api/clientview.js';
import '/src/server/api/clientedit.js';
import '/src/server/api/projectadd.js';
import '/src/server/api/projectview.js';
import '/src/server/api/projectedit.js';
import '/src/server/api/composer.js';
import '/src/server/api/recent.js';
import '/src/server/api/taskgroups.js';
import '/src/server/api/teammonitor.js';
import '/src/server/api/timetracker.js';
import '/src/server/api/usermonitor.js';
import '/src/server/api/adminexporters.js';
import '/src/server/api/admininoutoptions.js';
import '/src/server/api/adminmainsettings.js';
import '/src/server/api/admintaskgroups.js';
import '/src/server/api/adminteams.js';
import '/src/server/api/admintermination.js';
import '/src/server/api/adminusers.js';
import '/src/server/api/autocomplete.js';
import '/src/server/api/demodata.js';
import '/src/server/api/signup.js';
import '/src/server/api/times.js';
import '/src/server/api/inout.js';
import '/src/server/api/projectpicker.js';
import '/src/server/api/usersettings.js';
import '/src/server/api/users.js';
