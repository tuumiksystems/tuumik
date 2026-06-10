<!-- Copyright (C) 2017-2025 Tuumik Systems OÜ -->

<template>
  <div v-show="show" :style="popupStyle()" class="time-popup">
    <ul class="ul-vert">
      <li>
        <span v-if="time.clientName" class="client-name">{{ time.clientName }}</span>
        <span v-else class="text-grey">No client</span>
      </li>
      <li>
        <span v-if="time.projectName" class="project-name">{{ time.projectName }}</span>
        <span v-else class="text-grey">No project</span>
      </li>
      <li>
        <span v-if="time.useTaskType">{{ time.taskType }} </span>{{ time.taskDesc }}
      </li>
      <li v-if="time.intCom" class="intcom">{{ time.intCom }}</li>
      <li>
        <span class="time-dur">{{ displayDuration(time) }}</span>
        <span class="time-start-end">{{ displayTimeFromMinutes(time.startMinute) }} - {{ displayTimeFromMinutes(time.endMinute) }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { useGeneralStore } from '/src/client/stores/general.js';
import dayjs from 'dayjs';
import { minutesToDuration } from '/src/shared/utils/time.js';

const generalStore = useGeneralStore();

const props = defineProps({
  time: { type: Object, required: true },
  show: { type: Boolean, default: false },
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
});

function popupStyle() {
  return `left: ${props.x + 20}px; top: ${props.y}px;`;
}

function displayTimeFromMinutes(minutes) {
  const timeFormat = generalStore.tenant.timeFormat || 'HH:mm';
  return dayjs().hour(0).minute(minutes).format(timeFormat);
}

function displayDuration(time) {
  const x = time.endMinute - time.startMinute;
  return minutesToDuration(x);
}
</script>

<style scoped>
.time-popup {
  position: fixed;
  width: 250px;
  padding: 1em;
  background-color: #ffffff;
  border: 1px solid #7f7f7f;
  border-radius: 0.3em;
  z-index: 1;
  box-shadow: 0.1em 0.1em 0.2em 0.2em rgba(0, 0, 0, 0.1);
}

.ul-vert {
  list-style-type: none;
  margin: 0;
  padding: 0;
  color: #2d2d2d;
}

.client-name {
  font-weight: 600;
}

.project-name {
  font-weight: 600;
}

.time-dur {
  color: #000000;
  border: 1px solid #7f7f7f;
  padding: 2px 6px;
  border-radius: 3px;
  margin: 6px 3px 0 0;
  display: inline-block;
  white-space: nowrap;
}

.time-start-end {
  color: #000000;
  border: 1px solid #7f7f7f;
  padding: 2px 6px;
  border-radius: 3px;
  margin: 6px 0 0 0;
  display: inline-block;
  white-space: nowrap;
}
</style>
