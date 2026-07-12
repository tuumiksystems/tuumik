<!-- Copyright (C) 2026 Tuumik Systems OÜ -->

<template>
  <form class="main-pane" @submit.prevent="saveSettings()">
    <h2 class="top-h2">AI Settings</h2>
    <label for="user-ai-instructions" class="field-label">INSTRUCTIONS FOR AI TOOLS (USER-SPECIFIC):</label>
    <textarea id="user-ai-instructions" v-model="aiInstructions" rows="6" maxlength="2000"></textarea>
    <div class="field-tip">Max 2000 characters. Keep instructions as short and clear as possible.</div>
    <input type="submit" value="SAVE CHANGES" class="btn-submit mt-1" />
    <div v-if="loading" class="spinner spinner-global"></div>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useNotifierStore } from '/src/client/stores/notifier.js';

const notifierStore = useNotifierStore();

const loading = ref(false);
const aiInstructions = ref('');

onMounted(() => {
  loadSettings();
});

async function loadSettings() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('getAiSettingsSelf');
    aiInstructions.value = res.aiInstructions || '';
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

async function saveSettings() {
  loading.value = true;
  try {
    await Meteor.callAsync('saveAiSettingsSelf', { aiInstructions: aiInstructions.value });
    notifierStore.addTemp({ type: 'success', txt: 'SETTINGS SAVED' });
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}
</script>
