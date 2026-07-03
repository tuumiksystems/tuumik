<!-- Copyright (C) 2026 Tuumik Systems OÜ -->

<template>
  <div class="consent-body">
    <div class="consent-box">
      <div class="logo"></div>
      <h2>Authorize Access</h2>
      <div v-if="loading" class="spinner spinner-local"></div>
      <div v-else-if="fatalErr" class="err">{{ fatalErr }}</div>
      <div v-else-if="approved">Access granted. You can close this window and return to {{ clientName }}.</div>
      <div v-else>
        <div class="consent-text">
          <span class="client-name">{{ clientName }}</span> wants to access Tuumik as
          <span class="client-name">{{ userName }}</span>.
        </div>
        <label for="role" class="field-label">GRANT ROLE:</label>
        <select id="role" v-model="role">
          <option value="regularReadOnly">REGULAR (READ-ONLY)</option>
          <option value="regularReadWrite">REGULAR (READ AND WRITE)</option>
          <option value="admin">ADMIN (READ AND WRITE)</option>
        </select>
        <div class="consent-actions">
          <span class="btn-submit pa-1" @click="approve()">AUTHORIZE</span>
          <span class="btn pa-1" @click="deny()">DENY</span>
        </div>
        <div v-if="err" class="err">{{ err }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Meteor } from 'meteor/meteor';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useGeneralStore } from '/src/client/stores/general.js';

const route = useRoute();
const generalStore = useGeneralStore();

const loading = ref(true);
const fatalErr = ref(null);
const err = ref(null);
const clientName = ref('');
const role = ref('regularReadWrite');
const approved = ref(false);

const userName = generalStore.user?.name || '';

const clientId = typeof route.query.client_id === 'string' ? route.query.client_id : '';
const redirectUri = typeof route.query.redirect_uri === 'string' ? route.query.redirect_uri : '';
const state = typeof route.query.state === 'string' ? route.query.state : '';
const codeChallenge = typeof route.query.code_challenge === 'string' ? route.query.code_challenge : '';
const codeChallengeMethod = typeof route.query.code_challenge_method === 'string' ? route.query.code_challenge_method : '';
const responseType = typeof route.query.response_type === 'string' ? route.query.response_type : 'code';
const scope = typeof route.query.scope === 'string' ? route.query.scope : '';

function redirectBack(params) {
  const url = new URL(redirectUri);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  if (state) url.searchParams.set('state', state);
  window.location.href = url.toString();
}

onMounted(async () => {
  if (!clientId || !redirectUri) {
    // the redirect target is not trustworthy, show the error here instead
    fatalErr.value = 'Invalid authorization request: missing client_id or redirect_uri.';
    loading.value = false;
    return;
  }
  try {
    const res = await Meteor.callAsync('getOauthClientForConsent', clientId, redirectUri);
    clientName.value = res.clientName;
  } catch (e) {
    fatalErr.value = e.reason || 'Invalid authorization request.';
    loading.value = false;
    return;
  }
  // the client checks out, remaining request problems are reported by redirect
  if (responseType !== 'code') {
    redirectBack({ error: 'unsupported_response_type' });
    return;
  }
  if (!codeChallenge || codeChallengeMethod !== 'S256') {
    redirectBack({ error: 'invalid_request', error_description: 'PKCE with S256 is required' });
    return;
  }
  // preselect the role from the requested scope, the user can still change it
  const scopes = scope.split(' ');
  if (scopes.includes('admin')) role.value = 'admin';
  else if (scopes.includes('read') && !scopes.includes('write')) role.value = 'regularReadOnly';
  loading.value = false;
});

async function approve() {
  err.value = null;
  loading.value = true;
  try {
    const res = await Meteor.callAsync('approveOauthAuthorization', {
      clientId,
      redirectUri,
      codeChallenge,
      codeChallengeMethod,
      role: role.value,
    });
    approved.value = true;
    redirectBack({ code: res.code });
  } catch (e) {
    err.value = e.reason || 'Authorization failed.';
  }
  loading.value = false;
}

function deny() {
  redirectBack({ error: 'access_denied' });
}
</script>

<style scoped>
.consent-body {
  display: flex;
  justify-content: center;
}

.consent-box {
  position: relative;
  margin: 10vh 0 0 0;
  width: 24em;
  padding: 2em;
  background-color: #ffffff;
  text-align: center;
  border-radius: 0.3em;
  box-shadow: 0.1em 0.1em 0.2em 0.2em rgba(0, 0, 0, 0.1);
}

.logo {
  width: 4em;
  height: 4em;
  margin: 0 auto;
  background-image: url('/icons/logo.svg');
  background-repeat: no-repeat;
  background-size: auto 100%;
  background-position: center;
}

.consent-text {
  margin: 1em 0;
}

.client-name {
  font-weight: 600;
}

.field-label {
  display: block;
}

.consent-actions {
  display: flex;
  justify-content: center;
  gap: 1em;
  margin: 1.5em 0 0 0;
}

.err {
  margin: 1.5em 0 0 0;
  padding: 1em;
  background-color: #44404d;
  color: #ffffff;
  font-weight: 600;
  border-radius: 0.3em;
}

.spinner-local {
  width: 2em;
  height: 2em;
  margin: 1em auto;
}
</style>
