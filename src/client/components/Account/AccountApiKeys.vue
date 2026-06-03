<!-- Copyright (C) 2017-2025 Tuumik Systems OÜ -->

<template>
  <div class="main-pane">
    <h2 class="top-h2">API Keys</h2>
    <div v-if="loading" class="spinner spinner-local"></div>
    <div v-if="!editedUser">No user found</div>
    <div v-else>
      <div v-for="apiKey in editedUser.apiKeys" :key="apiKey.id" class="key-list-item mb-1">
        <div class="key-box-id ma-1">
          <div class="key-title">ID</div>
          <div>{{ apiKey.id }}</div>
        </div>
        <div class="key-box-expiry ma-1">
          <div class="key-title">EXPIRY</div>
          <div v-if="apiKey.expires">{{ displayDate(apiKey.expires) }}</div>
          <div v-else>-</div>
        </div>
        <div class="key-box-created ma-1">
          <div class="key-title">CREATED</div>
          <div>{{ displayDate(apiKey.created) }}</div>
        </div>
        <div class="key-box-role ma-1">
          <div class="key-title">ROLE</div>
          <div v-if="apiKey.role === 'regularReadOnly'" class="text-green">REGULAR (READ-ONLY)</div>
          <div v-else-if="apiKey.role === 'regularReadWrite'" class="text-brown">REGULAR (READ AND WRITE)</div>
          <div v-else-if="apiKey.role === 'admin'" class="text-red">ADMIN (READ AND WRITE)</div>
          <div v-else>{{ apiKey.role }}</div>
        </div>
        <div v-if="apiKey.desc" class="key-box-desc ma-1">
          <div class="key-title">DESCRIPTION</div>
          <div>{{ apiKey.desc }}</div>
        </div>
        <div class="key-box-action ma-1">
          <div class="btn" @click="removeApiKey(apiKey.id)">REMOVE</div>
        </div>
      </div>
      <div v-if="editedUser.apiKeys && !editedUser.apiKeys.length" class="mt-1 mb-1">
        No API keys found.
      </div>
      <span v-if="!showForm" class="btn" @click="showForm = true">CREATE NEW API KEY</span>
      <form v-if="showForm" class="create-key-holder pa-1" @submit.prevent="createApiKey()">
        <h2 class="top-h2">Create new API key</h2>
        <label for="role" class="field-label">ROLE:</label>
        <select id="role" v-model="newKeyRole">
          <option value="regularReadOnly">REGULAR (READ-ONLY)</option>
          <option value="regularReadWrite">REGULAR (READ AND WRITE)</option>
          <option value="admin">ADMIN (READ AND WRITE)</option>
        </select>
        <label for="desc" class="field-label">DESCRIPTION (OPTIONAL):</label>
        <input id="desc" v-model="newKeyDesc" type="text" maxlength="50" />
        <input type="submit" value="ADD API KEY" class="btn-submit mr-1" />
        <span class="btn" @click="showForm = false">CANCEL</span>
        <div v-if="loading" class="spinner spinner-global"></div>
      </form>
      <div v-if="createdToken" class="new-key-holder pa-1">
        New API key created. Your key is:
        <div class="new-token">{{ createdToken }}</div>
        <div>For security reasons this key will be shown only once to you right now and then never again in this app.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();

const loading = ref(false);
const editedUser = ref(null);
const showForm = ref(false);
const newKeyRole = ref('regularReadOnly');
const newKeyDesc = ref('');
const createdToken = ref(null);

onMounted(() => {
  loadUser();
});

async function loadUser() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('getApiKeysSelf');
    editedUser.value = res.editedUser;
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

async function createApiKey() {
  loading.value = true;
  const role = newKeyRole.value;
  const desc = newKeyDesc.value;
  try {
    const res = await Meteor.callAsync('createApiKeySelf', role, desc);
    createdToken.value = res.createdToken;
    showForm.value = false;
    loadUser();
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

async function removeApiKey(apiKeyId) {
  loading.value = true;
  try {
    await Meteor.callAsync('removeApiKeySelf', apiKeyId);
    createdToken.value = null;
    loadUser();
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function displayDate(date, notUtc, customFormat) {
  const format = customFormat || generalStore.tenant.dateFormat;
  return !notUtc ? dayjs.utc(date).format(format) : dayjs(date).format(format);
}
</script>

<style scoped>
.key-list-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  background-color: #f1f1f1;
  border: 1px solid #c9c9c9;
  border-radius: 0.3em;
}

.key-title {
  color: #9f9f9f;
}

.key-box-id {
  width: 7em;
}

.key-box-expiry {
  width: 10em;
}

.key-box-created {
  width: 10em;
}

.key-box-role {
  width: 15em;
}

.key-box-desc {
  width: 15em;
}

.key-box-action {
  width: 100%;
}

.create-key-holder {
  background-color: #cce3db;
  border: 1px solid #9aaba5;
  margin: 2em 0 1em 0;
  border-radius: 0.3em;
}

.new-key-holder {
  background-color: #227052;
  color: #ffffff;
  margin: 2em 0 1em 0;
  border-radius: 0.3em;
}

.new-token {
  font-weight: 600;
  margin: 1em 0;
}

.spinner-local {
  width: 2em;
  height: 2em;
  margin: 0;
}
</style>
