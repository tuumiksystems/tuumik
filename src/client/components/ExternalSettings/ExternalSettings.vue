<!-- Copyright (C) 2017-2025 Tuumik Systems OÜ -->

<template>
  <div></div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';

const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();

onMounted(() => {
  loadSignupSettings();
});

async function loadSignupSettings() {
  try {
    const res = await Meteor.callAsync('loadSignupSettings');
    generalStore.allowSignup = res.allowSignup;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
  }
}
</script>
