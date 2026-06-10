This is a time tracking app written in Meteor/Node and Vue 3.

In /src/server/core/ and /src/shared/core/ there are core functions that can be called either via DDP by Meteor methods or via HTTP endpoints.
The Meteor methods are in /src/server/methods/ and /src/shared/methods/. And the HTTP endpoints are in /src/server/api/.

The Meteor methods are primarily for use by human users via the Meteor frontend. And the HTTP endpoints are primarily for use by AI tools.

Most Meteor methods are located in server-only code (/src/server/methods).

Some methods are located in shared code that is accessible on both server-side and client-side (/src/shared/methods). These are methods that make use of Meteor's optimistic UI feature which simulates method calls on client side and later reconciles with server results. Core functions that are called by such shared methods are therefore also in shared code in /src/shared/core/.

HTTP endpoints use x-api-key headers to authenticate and authorize requests. This is in /src/server/api/auth.js. Each API key is linked to a user. Users can have multiple API keys. API keys contain a role. Roles are in /src/server/api/roles.js.
