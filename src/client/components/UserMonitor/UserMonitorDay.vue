<!-- Copyright (C) 2017-2025 Tuumik Systems OÜ -->

<template>
  <div>
    <UserMonitorVert v-if="dispMode === 'vert'" :target-day="targetDay" :target-user="targetUser" :style="vertHolderStyle()" />
    <UserMonitorText v-else :target-day="targetDay" :target-user="targetUser" />
  </div>
</template>

<script setup>
import UserMonitorVert from '/src/client/components/UserMonitor/UserMonitorVert.vue';
import UserMonitorText from '/src/client/components/UserMonitor/UserMonitorText.vue';

const props = defineProps({
  monitorDate: { type: Number, required: true },
  targetDay: { type: Object, required: true },
  targetUser: { type: Object, required: true },
  dispMode: { type: String, required: true },
  sizeVert: { type: Number, required: true },
});

function vertHolderStyle() {
  return `width: ${props.sizeVert}em;`;
}
</script>
