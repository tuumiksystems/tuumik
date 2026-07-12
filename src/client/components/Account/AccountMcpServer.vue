<!-- Copyright (C) 2026 Tuumik Systems OÜ -->

<template>
  <div class="main-pane">
    <h2 class="top-h2">MCP Server</h2>
    <div>To connect your AI tool to this app, add the following MCP server in it:</div>
    <div class="mcp-address mt-1 pa-1">{{ generalStore.settings.mcpServerUrl }}</div>
  </div>
</template>

<script setup>
import { useGeneralStore } from '/src/client/stores/general.js';

const generalStore = useGeneralStore();
</script>

<style scoped>
.mcp-address {
  background-color: #e9e9e9;
  border-radius: 0.15em;
  font-size: 1.5em;
}
</style>
