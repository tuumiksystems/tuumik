<!-- Copyright (C) 2017-2025 Tuumik Systems OÜ -->

<template>
  <div>
    <InOutIconsTitleDesk :selected-team="selectedTeam" :selected-user="selectedUser" />
    <div class="board-holder">
      <div
        v-for="inOutUser in inOutUsers"
        :key="inOutUser._id"
        :class="{ 'user-holder-on': editUser && inOutUser._id === editUser._id, 'is-recent': isRecent(inOutUser.inOutUpdateAt) }"
        class="user-holder"
        @click="openEditPopup(inOutUser)"
      >
        <div v-if="inOutUser.pic" :style="avatarPicStyle(inOutUser)" class="avatar-pic"></div>
        <div v-else-if="inOutUser.nameShort" class="avatar-text"><div class="avatar-text-name">{{ inOutUser.nameShort }}</div></div>
        <div v-else class="avatar-pic"></div>
        <div :style="statusStyle(inOutUser.inOutStatus)" class="m-status">
          <span class="m-status2">{{ statusText(inOutUser.inOutStatus) }}</span>
        </div>
        <div class="m-name">{{ inOutUser.name }}</div>
        <div v-if="inOutUser.inOutETA" class="m-eta-desc"> ETA: {{ displayEta(inOutUser) }} </div>
        <div class="m-note">{{ inOutUser.inOutNote }}</div>
        <div class="m-bottom">
          <span v-if="isToday(inOutUser.inOutUpdateAt)" class="updated-today">
            {{ displayTime(inOutUser.inOutUpdateAt, true) }}
          </span>
          <span v-else-if="isYesterday(inOutUser.inOutUpdateAt)" class="updated-yesterday">
            {{ displayDate(inOutUser.inOutUpdateAt, true) }}
          </span>
          <span v-else class="updated-past">{{ displayDate(inOutUser.inOutUpdateAt, true) }}</span>
          <span v-if="inOutUser.inOutUpdateById && inOutUser.inOutUpdateById === inOutUser._id" class="m-updater-user">Self</span>
          <span v-else-if="inOutUser.inOutUpdateByName" class="m-updater-user">{{ inOutUser.inOutUpdateByName }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGeneralStore } from '/src/client/stores/general.js';
import { displayEtaInTz } from '/src/shared/utils/time.js';
import InOutIconsTitleDesk from '/src/client/components/InOut/InOutIconsTitleDesk.vue';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const generalStore = useGeneralStore();

const props = defineProps({
  inOutUsers: { type: Array, required: true },
  editUser: { type: [null, Object], required: true },
  selectedTeam: { type: [null, Object], required: true },
  selectedUser: { type: [null, Object], required: true },
  timeNow: { type: Date, required: true },
});

const emit = defineEmits(['set-edit-user']);

function avatarPicStyle(inOutUser) {
  if (!inOutUser.pic) return false;
  return `background-image: url('${inOutUser.pic}');`;
}

function statusStyle(inOutStatus) {
  const inOutOptions = generalStore.tenant.inOutOptions;
  const opt = inOutOptions.find(x => x.id === inOutStatus);
  const colorBG = opt?.colorBG ? opt.colorBG : '#3f3f3f';
  const colorTxt = opt?.colorTxt ? opt.colorTxt : '#000000';
  return `background-color: ${colorBG}; color: ${colorTxt};`;
}

function statusText(inOutStatus) {
  const inOutOptions = generalStore.tenant.inOutOptions;
  const opt = inOutOptions.find(x => x.id === inOutStatus);
  return opt?.text ? opt.text : '-';
}

function displayEta(inOutUser) {
  return displayEtaInTz(inOutUser.inOutETA, inOutUser.timezone, generalStore.tenant.dateFormat, generalStore.tenant.timeFormat);
}

function displayDate(date, notUtc, customFormat) {
  const format = customFormat || generalStore.tenant.dateFormat;
  return !notUtc ? dayjs.utc(date).format(format) : dayjs(date).format(format);
}

function displayTime(date, notUtc, customFormat) {
  const format = customFormat || generalStore.tenant.timeFormat;
  return !notUtc ? dayjs.utc(date).format(format) : dayjs(date).format(format);
}

function isRecent(dt) {
  if (dayjs(dt).diff(props.timeNow, 'minutes') >= -5) return true;
  return false;
}

function isToday(dt) {
  if (dayjs(dt).isSame(props.timeNow, 'day')) return true;
  return false;
}

function isYesterday(dt) {
  const yesterday = dayjs(props.timeNow).subtract(1, 'days');
  if (dayjs(dt).isSame(yesterday, 'day')) return true;
  return false;
}

function openEditPopup(inOutUser) {
  if (generalStore.user.permissions.inOutEditOthers) emit('set-edit-user', inOutUser);
}
</script>

<style scoped>
.board-holder {
  margin: 0 0 9em 0;
}

.user-holder {
  min-height: 6em;
  margin: 0 0.4em 2em 0;
  padding: 0.4em 0.4em 0.4em 7em;
  background-color: #ffffff;
  position: relative;
  box-shadow: 0 0 0.9em 0 rgba(0, 0, 0, 0.07);
  border: 1px solid #cecece;
  border-radius: 0.9em;
  cursor: pointer;
}

.user-holder:hover {
  border: 1px solid #4f4f4f;
}

.user-holder-on {
  outline: 3px solid #000000;
}

.avatar-pic {
  position: absolute;
  top: 1em;
  left: 1em;
  height: 4.5em;
  width: 4.5em;
  background-color: #ffffff;
  border: 1px solid #9f9f9f;
  border-radius: 50%;
  background-image: url('/icons/person.svg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
}

.avatar-text {
  position: absolute;
  top: 1em;
  left: 1em;
  height: 4.5em;
  width: 4.5em;
  background-color: #ffffff;
  border: 1px solid #9f9f9f;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: default;
}

.avatar-text-name {
  font-size: 2em;
  font-weight: 600;
  color: #6e6e6e;
}

.m-status {
  height: 2em;
  width: 14em;
  line-height: 2em;
  padding: 0 0.6em;
  transition: background-color 1000ms ease-out, color 1000ms ease-out;
}

.m-status2 {
  overflow: hidden;
  white-space: nowrap;
}

.m-eta-desc {
  padding: 0 0.3em;
  color: #e4e4e4;
  background-color: #1f1f1f;
  font-weight: 600;
  border-radius: 0.3em;
  overflow: hidden;
  display: inline-block;
}

.m-name {
  color: #1f1f1f;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
}

.m-note {
  color: #1f1f1f;
  line-height: 1em;
  overflow: hidden;
}

.m-bottom {
  color: #4f4f4f;
  white-space: nowrap;
  overflow: hidden;
}

.m-updater-user {
  color: #4f4f4f;
  margin: 0 0 0 0.3em;
}
</style>
