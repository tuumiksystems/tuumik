<!-- Copyright (C) 2017-2025 Tuumik Systems OÜ -->

<template>
  <div>
    <TeamMonitorVert v-if="dispMode === 'vert'" :target-user="targetUser" :style="vertHolderStyle()" />
    <TeamMonitorText v-else :target-user="targetUser" />
  </div>
</template>

<script setup>
import TeamMonitorVert from '/src/client/components/TeamMonitor/TeamMonitorVert.vue';
import TeamMonitorText from '/src/client/components/TeamMonitor/TeamMonitorText.vue';

const props = defineProps({
  monitorDate: { type: Number, required: true },
  targetUser: { type: Object, required: true },
  dispMode: { type: String, required: true },
  sizeVert: { type: Number, required: true },
});

function vertHolderStyle() {
  return `width: ${props.sizeVert}em;`;
}
</script>
