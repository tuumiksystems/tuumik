<!-- Copyright (C) 2017-2025 Tuumik Systems OÜ -->

<template>
  <div class="user-holder">
    <div class="headerbar">
      <div :style="avatarStyle(targetUser)" class="avatar-holder"></div>
      <div class="hb-content">
        <div v-if="targetUser && targetUser.name" class="hb-name">{{ targetUser.name }}</div>
        <div>
          <span class="hb-work">{{ displayDuration3(targetUser.workTotal) }}</span>
        </div>
        <div>
          <span class="hb-time">{{ displayDuration2(targetUser.timesTotal) }}</span>
        </div>
      </div>
    </div>
    <div :style="{ backgroundImage: baseBackground().image, backgroundSize: baseBackground().size }" class="times-base">
      <TeamMonitorRuler />
      <TeamMonitorStatusBar />
      <TeamMonitorStatusBox v-for="status in targetUser.statuses" :key="status._id" :status="status" />
      <TeamMonitorTimeBox v-for="time in targetUser.times" :key="time._id" :time="time" />
    </div>
  </div>
</template>

<script setup>
import { useGeneralStore } from '/src/client/stores/general.js';
import TeamMonitorRuler from '/src/client/components/TeamMonitor/TeamMonitorRuler.vue';
import TeamMonitorStatusBar from '/src/client/components/TeamMonitor/TeamMonitorStatusBar.vue';
import TeamMonitorStatusBox from '/src/client/components/TeamMonitor/TeamMonitorStatusBox.vue';
import TeamMonitorTimeBox from '/src/client/components/TeamMonitor/TeamMonitorTimeBox.vue';
import { minutesToDuration } from '/src/shared/utils/time.js';

const generalStore = useGeneralStore();

const props = defineProps({
  targetUser: { type: Object, required: true },
});

function baseBackground() {
  const trackerStep = generalStore.tenant.trackerStep;
  const step = trackerStep === 1 ? 6 : trackerStep;
  const pixelsPerMinute = 2;
  const gridStep = pixelsPerMinute * step;
  const image = `linear-gradient(to bottom, #ffffff, #ffffff ${gridStep - 1}px, #f0f0f0 ${gridStep - 1}px, #f0f0f0 ${gridStep}px)`;
  const size = `auto ${gridStep}px`;
  return { image, size };
}

function avatarStyle(targetUser) {
  if (!targetUser.pic) return false;
  return `background-image: url('${targetUser.pic}');`;
}

function displayDuration2(minutes) {
  return minutesToDuration(minutes);
}

function displayDuration3(millis) {
  const minutes = Math.floor(millis / 60000);
  return minutesToDuration(minutes);
}
</script>

<style scoped>
.user-holder {
  width: 10em;
  margin: 4em 1.2em 0 0;
  border: 1px solid #cecece;
  border-radius: 0.3em;
}

.headerbar {
  position: -webkit-sticky;
  position: sticky;
  top: 10em;
  height: 6em;
  margin: -1px -1px 0 -1px;
  background-color: #e0e0e0;
  border: 1px solid #cecece;
  border-radius: 0.3em;
  z-index: 1;
}

.avatar-holder {
  position: absolute;
  top: 0;
  left: 0;
  height: 5.8em;
  width: 5.8em;
  background-color: #e9e9e9;
  border: 1px solid #cecece;
  border-radius: 0.3em 0.3em 0 0;
  background-image: url('/icons/person.svg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
}

.hb-content {
  position: absolute;
  top: 0.3em;
  left: 6.4em;
  right: 0;
  overflow: hidden;
}

.hb-name {
  font-weight: 600;
  overflow: hidden;
  white-space: nowrap;
}

.hb-work {
  color: #ffffff;
  background-color: #000000;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 600;
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
}

.hb-time {
  color: #000000;
  background-color: #ffffff;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 600;
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
}

.times-base {
  width: 100%;
  height: 2880px;
  position: relative;
}
</style>
