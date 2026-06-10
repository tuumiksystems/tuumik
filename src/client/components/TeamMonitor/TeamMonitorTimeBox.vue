<!-- Copyright (C) 2017-2025 Tuumik Systems OÜ -->

<template>
  <div :style="timeboxStyle(time)" class="timebox-vert" @mouseenter="isHovered = true" @mouseleave="isHovered = false" @mousemove="updateMousePosition($event)">
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
    <TeamMonitorTimePopup :time="time" :show="isHovered" :x="mouseX" :y="mouseY" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import dayjs from 'dayjs';
import TeamMonitorTimePopup from '/src/client/components/TeamMonitor/TeamMonitorTimePopup.vue';
import { minutesToDuration } from '/src/shared/utils/time.js';

const generalStore = useGeneralStore();

const props = defineProps({
  time: { type: Object, required: true },
});

const isHovered = ref(false);
const mouseX = ref(0);
const mouseY = ref(0);

function updateMousePosition(event) {
  mouseX.value = event.clientX;
  mouseY.value = event.clientY;
}

function timeboxStyle(time) {
  const pixelsPerMinute = 2;
  const top = time.startMinute * pixelsPerMinute;
  const bottom = (1440 - time.endMinute) * pixelsPerMinute + 1;
  let color = time.projectId && time.taskDesc && (!time.useTaskType || time.taskType) ? 'rgba(138, 245, 138, 0.7)' : 'rgba(230, 230, 230, 0.7)';
  if (time.plan) color = 'rgba(156, 184, 230, 0.7)';
  return `top: ${top}px; bottom: ${bottom}px; background-color: ${color};`;
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
.timebox-vert {
  position: absolute;
  left: 3.9em;
  right: 0.2em;
  overflow: hidden;
  border: 1px solid #333333;
  border-radius: 4px;
  animation: timein 1000ms 0ms ease;
  cursor: default;
}

.timebox-vert:hover {
  outline: 5px solid black;
}

.ul-vert {
  list-style-type: none;
  margin: 0.1em 0.3em;
  padding: 0;
  white-space: nowrap;
  color: #2d2d2d;
}

@keyframes timein {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
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
  margin: 3px 3px 3px 0;
  display: inline-block;
  white-space: nowrap;
}

.time-start-end {
  color: #000000;
  border: 1px solid #7f7f7f;
  padding: 2px 6px;
  border-radius: 3px;
  margin: 3px 0 3px 0;
  display: inline-block;
  white-space: nowrap;
}
</style>
