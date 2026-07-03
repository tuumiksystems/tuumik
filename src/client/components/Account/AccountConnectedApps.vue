<!-- Copyright (C) 2026 Tuumik Systems OÜ -->

<template>
  <div class="main-pane">
    <h2 class="top-h2">Connected Apps</h2>
    <div v-if="loading" class="spinner spinner-local"></div>
    <div v-else>
      <div v-for="grant in grants" :key="grant._id" class="grant-list-item mb-1">
        <div class="grant-box-client ma-1">
          <div class="grant-title">APP</div>
          <div>{{ grant.clientName }}</div>
        </div>
        <div class="grant-box-role ma-1">
          <div class="grant-title">ROLE</div>
          <div v-if="grant.role === 'regularReadOnly'" class="text-green">REGULAR (READ-ONLY)</div>
          <div v-else-if="grant.role === 'regularReadWrite'" class="text-brown">REGULAR (READ AND WRITE)</div>
          <div v-else-if="grant.role === 'admin'" class="text-red">ADMIN (READ AND WRITE)</div>
          <div v-else>{{ grant.role }}</div>
        </div>
        <div class="grant-box-date ma-1">
          <div class="grant-title">CONNECTED</div>
          <div>{{ displayDate(grant.created) }}</div>
        </div>
        <div class="grant-box-date ma-1">
          <div class="grant-title">LAST USED</div>
          <div>{{ displayDate(grant.lastUsed) }}</div>
        </div>
        <div class="grant-box-date ma-1">
          <div class="grant-title">EXPIRY</div>
          <div>{{ displayDate(grant.refreshTokenExpires) }}</div>
        </div>
        <div class="grant-box-action ma-1">
          <div class="btn" @click="removeGrant(grant._id)">REMOVE</div>
        </div>
      </div>
      <div v-if="!grants.length" class="mt-1 mb-1">
        No connected apps found. Apps are connected by authorizing them through the OAuth flow, for example when adding Tuumik as an MCP server in an AI tool.
      </div>
    </div>
  </div>
</template>

<script setup>
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { onMounted, ref } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';

dayjs.extend(utc);

const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();

const loading = ref(false);
const grants = ref([]);

onMounted(() => {
  loadGrants();
});

async function loadGrants() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('getOauthGrantsSelf');
    grants.value = res.grants;
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

async function removeGrant(grantId) {
  loading.value = true;
  try {
    await Meteor.callAsync('removeOauthGrantSelf', grantId);
    loadGrants();
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
.grant-list-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  background-color: #f1f1f1;
  border: 1px solid #c9c9c9;
  border-radius: 0.3em;
}

.grant-title {
  color: #9f9f9f;
}

.grant-box-client {
  width: 12em;
}

.grant-box-role {
  width: 15em;
}

.grant-box-date {
  width: 10em;
}

.grant-box-action {
  width: 100%;
}

.spinner-local {
  width: 2em;
  height: 2em;
  margin: 0;
}
</style>
