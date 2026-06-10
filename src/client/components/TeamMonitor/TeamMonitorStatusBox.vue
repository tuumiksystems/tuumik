<!-- Copyright (C) 2017-2025 Tuumik Systems OÜ -->

<template>
  <div :style="statusboxStyle(status)" class="statusbox-vert" @mouseenter="isHovered = true" @mouseleave="isHovered = false" @mousemove="updateMousePosition($event)">
    <div v-if="status.note" class="note-marker"></div>
    <div v-if="status.eta" class="eta-marker"></div>
    <TeamMonitorStatusPopup :status="status" :show="isHovered" :x="mouseX" :y="mouseY" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import TeamMonitorStatusPopup from '/src/client/components/TeamMonitor/TeamMonitorStatusPopup.vue';

const props = defineProps({
  status: { type: Object, required: true },
});

const isHovered = ref(false);
const mouseX = ref(0);
const mouseY = ref(0);

function updateMousePosition(event) {
  mouseX.value = event.clientX;
  mouseY.value = event.clientY;
}

function statusboxStyle(status) {
  const pixelsPerMinute = 2;
  const startMinute = status.start.getHours() * 60 + status.start.getMinutes();
  const endMinute = status.end.getHours() * 60 + status.end.getMinutes();
  const top = startMinute * pixelsPerMinute;
  const bottom = (1440 - endMinute) * pixelsPerMinute;
  return `top: ${top}px; bottom: ${bottom}px; background-color: ${status.colorBG};`;
}
</script>

<style scoped>
.statusbox-vert {
  position: absolute;
  left: 2.7em;
  width: 0.9em;
  overflow: hidden;
  box-sizing: border-box;
  border-bottom: 1px solid #333333;
  border-right: 1px solid #333333;
  border-left: 1px solid #333333;
  animation: timein 1000ms 0ms ease;
  transition: width 150ms ease;
}

.statusbox-vert:hover {
  width: 1.4em;
}

.note-marker {
  position: absolute;
  top: 5px;
  left: 0;
  right: 0;
  width: 4px;
  height: 4px;
  margin: 0 auto;
  background-color: #000000;
  border: 1px solid white;
}

.eta-marker {
  position: absolute;
  top: 12px;
  left: 0;
  right: 0;
  width: 4px;
  height: 4px;
  margin: 0 auto;
  background-color: #000000;
  border: 1px solid white;
}

@keyframes timein {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>
