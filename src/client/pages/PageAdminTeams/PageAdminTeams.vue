<!-- Copyright (C) 2017-2025 Tuumik Systems OÜ -->

<template>
  <div>
    <div v-if="loading" class="spinner spinner-global"></div>
    <h1>Teams</h1>
    <form v-if="!loading || teams.length" class="main-pane" @submit.prevent="saveTeams()">
      <div class="top-menu">
        <span class="btn" @click="addTeam()">ADD NEW</span>
        <span :class="{ 'sel-btn-on': selectedIndex > -1 }" class="btn sel-btn-off" @click="deleteTeam()">DELETE</span>
        <span :class="{ 'sel-btn-on': selectedIndex > 0 }" class="btn sel-btn-off" @click="moveTeamUp()">MOVE UP</span>
        <span :class="{ 'sel-btn-on': selectedIndex > -1 && selectedIndex < teams.length - 1 }" class="btn sel-btn-off" @click="moveTeamDown()">MOVE DOWN</span>
      </div>
      <div v-for="(team, index) in teams" :key="index" :class="{ 'option-box-on': index === selectedIndex }" class="option-box">
        <input v-model="team.name" type="text" maxlength="30" class="text-inp" />
        <div class="option-select" @click="selectedIndex = selectedIndex === index ? -1 : index"></div>
      </div>
      <input type="submit" value="SAVE CHANGES" class="btn-submit" />
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';

const notifierStore = useNotifierStore();

const loading = ref(false);
const teams = ref([]);
const selectedIndex = ref(-1);

onMounted(() => {
  loadTeams();
});

async function loadTeams() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('loadTeams');
    teams.value = res;
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

async function saveTeams() {
  loading.value = true;
  try {
    const res = await Meteor.callAsync('saveTeams', teams.value);
    teams.value = res;
    notifierStore.addTemp({ type: 'success', txt: 'TEAMS SAVED' });
    loading.value = false;
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
    loading.value = false;
  }
}

function addTeam() {
  const newTeam = { name: '' };
  if (teams.value.length < 30) teams.value.push(newTeam);
}

function deleteTeam() {
  if (selectedIndex.value > -1) {
    teams.value.splice(selectedIndex.value, 1);
    selectedIndex.value = -1;
  }
}

function moveTeamUp() {
  if (selectedIndex.value > 0) {
    const previous = teams.value[selectedIndex.value - 1];
    const selected = teams.value[selectedIndex.value];
    teams.value[selectedIndex.value - 1] = { ...selected };
    teams.value[selectedIndex.value] = { ...previous };
    selectedIndex.value -= 1;
  }
}

function moveTeamDown() {
  if (selectedIndex.value > -1 && selectedIndex.value < teams.value.length - 1) {
    const next = teams.value[selectedIndex.value + 1];
    const selected = teams.value[selectedIndex.value];
    teams.value[selectedIndex.value + 1] = { ...selected };
    teams.value[selectedIndex.value] = { ...next };
    selectedIndex.value += 1;
  }
}
</script>

<style scoped>
.section-title {
  border-bottom: 1px dashed #2d2d2d;
  margin: 4em 0 0 0;
  text-align: center;
}

.top-menu {
  margin: 0.9em 0;
}

.sel-btn-off {
  opacity: 0.2;
}

.sel-btn-on {
  opacity: 1;
}

.option-box {
  margin: 5px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.option-box-on {
  outline: 2px solid #000000;
}

.option-box .text-inp {
  width: 80%;
}

.option-select {
  height: 2.25em;
  width: 19.5%;
  background-color: #e7e7e7;
  border: 1px solid #cccccc;
  border-radius: 0.2em;
  background-image: url('/icons/arrow-left.svg');
  background-repeat: no-repeat;
  background-size: auto 40%;
  background-position: 90% 50%;
}

.option-select:hover {
  background-color: #ececec;
}
</style>
