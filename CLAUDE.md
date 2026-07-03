This is a time tracking app written in Meteor/Node and Vue 3.

The app is single-tenant. The `Tenant` collection (in /src/shared/collections/collections.js) holds at most one document, retrieved with `Tenant.findOneAsync()` (and updated with an empty selector, e.g. `Tenant.updateAsync({}, ...)`). Documents are not scoped by tenant — there is no `tenantId` field on users or other documents, and queries do not filter by tenant. Signup (/src/server/core/insertTenantAndUser.js) creates the single tenant plus the first admin user and is refused once a tenant already exists. When demo mode is enabled, /src/server/core/createDemo.js creates or refreshes demo data and logs the visitor into a demo user account.

In /src/server/core/ and /src/shared/core/ there are core functions that can be called either via DDP by Meteor methods or via HTTP endpoints.
The Meteor methods are in /src/server/methods/ and /src/shared/methods/. And the HTTP endpoints are in /src/server/api/.

The Meteor methods are primarily for use by human users via the Meteor frontend. And the HTTP endpoints are primarily for use by AI tools.

Most Meteor methods are located in server-only code (/src/server/methods).

Some methods are located in shared code that is accessible on both server-side and client-side (/src/shared/methods). These are methods that make use of Meteor's optimistic UI feature which simulates method calls on client side and later reconciles with server results. Core functions that are called by such shared methods are therefore also in shared code in /src/shared/core/.

HTTP endpoints accept two credentials, both checked in /src/server/api/auth.js: manual API keys sent in x-api-key headers, and OAuth 2.1 access tokens sent as Authorization Bearer headers. Each credential is linked to a user and contains a role. Roles are in /src/server/api/roles.js.

The app is also an OAuth 2.1 authorization server (for MCP clients): discovery metadata, dynamic client registration, token exchange and revocation are in /src/server/api/oauth.js, with the underlying logic in /src/server/core/oauth*.js and the oauth-clients/oauth-codes/oauth-grants collections. The authorization endpoint is the client-side route /oauth/authorize (/src/client/pages/OauthAuthorize.vue), where a logged-in user approves the client and picks a role via Meteor methods in /src/server/methods/oauth.js. Users manage their OAuth grants in the Connected Apps section of Account Settings.
