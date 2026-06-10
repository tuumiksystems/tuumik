<!-- Copyright (C) 2017-2025 Tuumik Systems OÜ -->

<template>
  <div v-show="show" :style="statusboxPopupStyle()" class="statusbox-popup">
    <div :style="statusStyle(status)" class="m-status">
      <span class="m-status2">{{ status.text }}</span>
    </div>
    <div v-if="status.note" class="spopup-note">Note: {{ status.note }}</div>
    <div v-if="status.eta" class="spopup-eta">ETA: {{ status.eta }}</div>
    <div class="spopup-dur">{{ displayDuration4(status) }}</div>
  </div>
</template>

<script setup>
import { minutesToDuration } from '/src/shared/utils/time.js';

const props = defineProps({
  status: { type: Object, required: true },
  show: { type: Boolean, default: false },
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
});

function statusboxPopupStyle() {
  return `left: ${props.x + 10}px; top: ${props.y + 10}px;`;
}

function statusStyle(status) {
  return `color: ${status.colorTxt}; background-color: ${status.colorBG};`;
}

function displayDuration4(status) {
  const millis = status.end - status.start;
  const minutes = Math.floor(millis / 60000);
  return minutesToDuration(minutes);
}
</script>

<style scoped>
.statusbox-popup {
  position: fixed;
  width: 16em;
  padding: 1em;
  z-index: 1000;
  border-radius: 0.4em;
  background-color: #ffffff;
  border: 1px solid #7f7f7f;
  box-shadow: 0.1em 0.1em 0.2em 0.2em rgba(0, 0, 0, 0.1);
}

.m-status {
  height: 2em;
  line-height: 2em;
  padding: 0 0.6em;
  text-align: center;
}

.m-status2 {
  overflow: hidden;
  white-space: nowrap;
}

.spopup-note {
  font-weight: 600;
  margin-top: 0.4em;
}

.spopup-eta {
  font-weight: 600;
  margin-top: 0.4em;
}

.spopup-dur {
  margin-top: 0.4em;
  color: #5f5f5f;
}
</style>
