<!-- Copyright (C) 2017-2025 Tuumik Systems OÜ -->

<template>
  <div class="sel-holder">
    <div v-if="selectedUser" class="sel-user">
      User:
      {{ selectedUser.name }}
    </div>
    <div v-else-if="selectedTeam" class="sel-team">
      Team:
      {{ selectedTeam.name }}
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  selectedTeam: { type: [null, Object], required: true },
  selectedUser: { type: [null, Object], required: true },
});
</script>

<style scoped>
.sel-holder {
  height: 4em;
  display: flex;
  align-items: center;
  margin: 0 1.2em;
}

.sel-user {
  font-size: 1.8em;
}

.sel-team {
  font-size: 1.8em;
}
</style>
