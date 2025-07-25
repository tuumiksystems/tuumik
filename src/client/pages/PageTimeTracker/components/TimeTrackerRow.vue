<!-- Copyright (C) 2017-2025 Tuumik Systems OÜ -->

<template>
  <div :class="timeClass" class="timebox">
    <TimeTrackerEditTime v-if="openId === time._id" :time="time" :client="client" :project="project" :task-groups="taskGroups" @set-open-id="setOpenId($event)" />
    <div class="edit-open" @click="setOpenId(time._id)"></div>
    <div v-if="openId === time._id" class="edit-close" @click="setOpenId('')"></div>
    <div v-if="!generalStore.isMobile" class="square-right">
      <ul class="drop-menu">
        <li class="r-delete" @click="timeRemove()">DELETE</li>
        <li class="r-copy" @click="timeCopy()">COPY</li>
      </ul>
    </div>
    <ul class="info-main">
      <li class="info-item">
        <span>{{ displayStart() }}</span>
        -
        <span>{{ displayEnd() }}</span>
        &bull;
        <span>{{ displayDuration() }}</span>
      </li>
      <li class="info-item info-client">
        <span v-if="client">{{ client.name }}</span
        ><span v-else>-</span>
      </li>
      <li class="info-item info-project">
        <span v-if="project">{{ project.name }}</span
        ><span v-else>-</span>
      </li>
      <li v-if="time.useTaskType" class="info-item">
        <span v-if="time.taskType">{{ time.taskType }}</span
        ><span v-else>-</span>
      </li>
      <li class="info-item">
        <span v-if="time.taskDesc">{{ time.taskDesc }}</span
        ><span v-else>-</span>
      </li>
      <li v-if="time.intCom" class="info-item info-intcom">
        {{ time.intCom }}
      </li>
      <li v-if="time.hideHistory" class="info-item info-hide">HIDDEN</li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue';
import { useGeneralStore } from '/src/client/stores/general.js';
import { useNotifierStore } from '/src/client/stores/notifier.js';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import TimeTrackerEditTime from './TimeTrackerEditTime.vue';
import { Clients, Projects } from '/src/shared/collections/collections.js';
import dayjs from 'dayjs';
import { minutesToDuration } from '/src/shared/utils/time.js';

const generalStore = useGeneralStore();
const notifierStore = useNotifierStore();

const props = defineProps({
  time: { type: Object, required: true },
  taskGroups: { type: Array, required: true },
  openId: { type: String, required: true },
});

const emit = defineEmits(['set-open-id']);

const client = ref(null);
const project = ref(null);

const timeClass = computed(() => {
  return {
    'timebox-open': props.openId === props.time._id,
    'timebox-plan': props.time.plan,
    'status-complete': props.time.projectId && props.time.taskDesc && (!props.time.useTaskType || props.time.taskType),
    'status-incomplete': !props.time.projectId || !props.time.taskDesc || (props.time.useTaskType && !props.time.taskType),
  };
});

const clientId = computed(() => {
  if (project.value) return project.value.clientId;
  if (props.time.clientId) return props.time.clientId;
  return '';
});

const projectId = computed(() => {
  return props.time.projectId;
});

function displayStart() {
  const minutes = props.time.startMinute;
  const timeFormat = generalStore.tenant.timeFormat || 'HH:mm';
  return dayjs().hour(0).minute(minutes).format(timeFormat);
}

function displayEnd() {
  const minutes = props.time.endMinute;
  const timeFormat = generalStore.tenant.timeFormat || 'HH:mm';
  return dayjs().hour(0).minute(minutes).format(timeFormat);
}

function displayDuration() {
  const minutes = props.time.endMinute - props.time.startMinute;
  return minutesToDuration(minutes);
}

function setOpenId(id) {
  emit('set-open-id', id);
}

async function timeRemove() {
  const timeId = props.time._id;
  try {
    await Meteor.callAsync('timeRemove', timeId);
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
  }
}

async function timeCopy() {
  const sourceTimeId = props.time._id;
  const now = new Date();
  const startMinute = now.getHours() * 60 + now.getMinutes();
  try {
    await Meteor.callAsync('timeInsertCopy', sourceTimeId, startMinute);
  } catch (err) {
    notifierStore.addTemp({ type: 'error', txt: err.reason });
  }
}

// SUBSCRIPTION CLIENT
let trackerSubClient = undefined;
let subClient = undefined;
const subClientReady = ref(false);

watch(clientId, (to, from) => {
  if (trackerSubClient) trackerSubClient.stop();
  if (subClient) subClient.stop();
  if (to) makeSubClient();
}, { immediate: true });

function makeSubClient() {
  trackerSubClient = Tracker.autorun(() => {
    subClient = Meteor.subscribe('clientForTime', clientId.value);
    subClientReady.value = subClient.ready();
  });
}
// /SUBSCRIPTION CLIENT

// LIVE QUERY CLIENT
let trackerQueryClient = undefined;

watch(clientId, (to, from) => {
  if (trackerQueryClient) trackerQueryClient.stop();
  makeQueryClient();
}, { immediate: true });

function makeQueryClient() {
  trackerQueryClient = Tracker.autorun(() => {
    client.value = Clients.findOne({ _id: clientId.value });
  });
}
// /LIVE QUERY CLIENT

// SUBSCRIPTION PROJECT
let trackerSubProject = undefined;
let subProject = undefined;
const subProjectReady = ref(false);

watch(projectId, (to, from) => {
  if (trackerSubProject) trackerSubProject.stop();
  if (subProject) subProject.stop();
  if (to) makeSubProject();
}, { immediate: true });

function makeSubProject() {
  trackerSubProject = Tracker.autorun(() => {
    subProject = Meteor.subscribe('projectForTime', projectId.value);
    subProjectReady.value = subProject.ready();
  });
}
// /SUBSCRIPTION PROJECT

// LIVE QUERY PROJECT
let trackerQueryProject = undefined;

watch(projectId, (to, from) => {
  if (trackerQueryProject) trackerQueryProject.stop();
  makeQueryProject();
}, { immediate: true });

function makeQueryProject() {
  trackerQueryProject = Tracker.autorun(() => {
    project.value = Projects.findOne({ _id: projectId.value });
  });
}
// /LIVE QUERY PROJECT

// METEOR CLEANUP
onUnmounted(() => {
  if (trackerSubClient) trackerSubClient.stop();
  if (trackerQueryClient) trackerQueryClient.stop();
  if (trackerSubProject) trackerSubProject.stop();
  if (trackerQueryProject) trackerQueryProject.stop();
  if (subClient) subClient.stop();
  if (subProject) subProject.stop();
});
// /METEOR CLEANUP
</script>

<style scoped>
.timebox {
  position: relative;
  padding: 0 3em 0 0;
  margin: 0 0 1em 0;
  border: 1px solid #6f6f6f;
  border-radius: 0.4em;
  background-color: #c4c4c4;
  color: #1f1f1f;
  box-shadow: 0.1em 0.1em 0.2em 0.2em rgba(0, 0, 0, 0.1);
  user-select: none;
}

.is-mobile .timebox {
  padding: 0;
}

div .timebox-open {
  background-color: orange;
}

div .timebox-plan {
  background-color: #9cb8e6;
}

.square-right {
  position: absolute;
  top: 0;
  right: 0.4em;
  width: 1.8em;
  height: 1.8em;
  max-height: 100%;
  background-color: #1c1c1c;
  border-radius: 0 0 0.4em 0.4em;
  z-index: 2;
}

.drop-menu {
  position: absolute;
  top: 0;
  right: 0;
  width: 20em;
  background-color: #1c1c1c;
  color: #eeeeee;
  border: 0.1em solid rgba(0, 0, 0, 0.3);
  border-radius: 0.2em;
  margin: 0;
  padding: 0;
  list-style-type: none;
  display: none;
  z-index: 12;
}

.square-right:hover .drop-menu {
  display: block;
}

.r-delete,
.r-copy {
  margin: 0;
  padding: 0 0.4em 0 2.7em;
  height: 2.6em;
  line-height: 2.6em;
  box-sizing: border-box;
  border-bottom: 0.1em solid #3a3a3a;
  border-right: 0.1em solid #3a3a3a;
}

.r-copy {
  border-bottom: none;
}

.r-delete:hover,
.r-copy-bottom:hover {
  background-color: #262626;
}

.edit-open {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
}

.edit-close {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #000000;
  opacity: 0.7;
  z-index: 2001;
}

.info-main {
  list-style-type: none;
  margin: 0;
  padding: 0;
  overflow-y: hidden;
  max-height: 100%;
  user-select: none;
  cursor: default;
  position: relative;
}

.info-item {
  padding: 0 0.8em;
}

.info-item:last-child {
  border-radius: 0 0 0.4em 0.4em;
  padding-bottom: 0.5em;
}

.info-client {
  color: #000000;
}

.info-project {
  color: #000000;
}

.info-intcom {
  color: brown;
}

.info-hide {
  color: green;
}

/* TIME STATUS */
.status-complete {
  background-color: #9be8a1;
}

.status-incomplete {
  background-color: #f9f9f9;
}

.status-locked {
  background-color: orange;
}
/* /TIME STATUS */
</style>
