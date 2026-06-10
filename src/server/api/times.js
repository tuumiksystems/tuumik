/* Copyright (C) 2017-2025 Tuumik Systems OÜ */

import { WebApp } from 'meteor/webapp';
import { authorizeApiRequest, apiHandler } from './auth.js';
import timeInsert from '/src/shared/core/timeInsert.js';
import timeInsertCopy from '/src/shared/core/timeInsertCopy.js';
import timeRemove from '/src/shared/core/timeRemove.js';
import timeSetPlan from '/src/shared/core/timeSetPlan.js';
import timeResizeTop from '/src/shared/core/timeResizeTop.js';
import timeResizeBottom from '/src/shared/core/timeResizeBottom.js';
import timeStartAndEnd from '/src/shared/core/timeStartAndEnd.js';
import timeMove from '/src/shared/core/timeMove.js';
import timeClientId from '/src/shared/core/timeClientId.js';
import timeProjectId from '/src/shared/core/timeProjectId.js';
import timeClearClient from '/src/shared/core/timeClearClient.js';
import timeClearProject from '/src/shared/core/timeClearProject.js';
import timeTaskType from '/src/shared/core/timeTaskType.js';
import timeTaskDesc from '/src/shared/core/timeTaskDesc.js';
import timeIntCom from '/src/shared/core/timeIntCom.js';
import timeHideHistory from '/src/shared/core/timeHideHistory.js';
import timeFillData from '/src/shared/core/timeFillData.js';

WebApp.handlers.post('/api/times/insert', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'timeInsert');
  if (!user) return;
  const args = { ...req.body, selDate: new Date(`${req.body.date}T00:00:00.001Z`) };
  const result = await timeInsert(user, args);
  res.status(201).json(result);
}));

WebApp.handlers.post('/api/times/:id/copy', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'timeInsertCopy');
  if (!user) return;
  await timeInsertCopy(user, req.params.id, req.body.startMinute);
  res.json({ ok: true });
}));

WebApp.handlers.delete('/api/times/:id/delete', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'timeRemove');
  if (!user) return;
  await timeRemove(user, req.params.id);
  res.json({ ok: true });
}));

WebApp.handlers.patch('/api/times/:id/plan/set', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'timeSetPlan');
  if (!user) return;
  await timeSetPlan(user, req.params.id, req.body.plan);
  res.json({ ok: true });
}));

// Timing: body {startMinute?, endMinute?, move?: bool}
// - startMinute only → resizeTop
// - endMinute only → resizeBottom
// - both → startAndEnd
// - startMinute + move:true → move (preserves duration)
WebApp.handlers.patch('/api/times/:id/timing/set', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'timeEditTiming');
  if (!user) return;
  const { startMinute, endMinute, move } = req.body;
  if (move && startMinute !== undefined) {
    await timeMove(user, req.params.id, startMinute);
  } else if (startMinute !== undefined && endMinute !== undefined) {
    await timeStartAndEnd(user, req.params.id, startMinute, endMinute);
  } else if (startMinute !== undefined) {
    await timeResizeTop(user, req.params.id, startMinute);
  } else if (endMinute !== undefined) {
    await timeResizeBottom(user, req.params.id, endMinute);
  }
  res.json({ ok: true });
}));

// Project: body {projectId?} | {clearProject: true} | {clearAll: true}
WebApp.handlers.patch('/api/times/:id/project/set', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'timeEditProject');
  if (!user) return;
  if (req.body.clearAll) {
    await timeClearClient(user, req.params.id);
  } else if (req.body.clearProject) {
    await timeClearProject(user, req.params.id);
  } else {
    await timeProjectId(user, req.params.id, req.body.projectId);
  }
  res.json({ ok: true });
}));

// Client: body {clientId?} | {clear: true}
WebApp.handlers.patch('/api/times/:id/client/set', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'timeEditClient');
  if (!user) return;
  if (req.body.clear) {
    await timeClearClient(user, req.params.id);
  } else {
    await timeClientId(user, req.params.id, req.body.clientId);
  }
  res.json({ ok: true });
}));

// Task fields: body {taskDesc?, taskType?, intCom?, hideHistory?: bool}
WebApp.handlers.patch('/api/times/:id/task/set', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'timeEditTask');
  if (!user) return;
  const { taskDesc, taskType, intCom, hideHistory } = req.body;
  if (taskDesc !== undefined) await timeTaskDesc(user, req.params.id, taskDesc);
  if (taskType !== undefined) await timeTaskType(user, req.params.id, taskType);
  if (intCom !== undefined) await timeIntCom(user, req.params.id, intCom);
  if (hideHistory !== undefined) await timeHideHistory(user, req.params.id, hideHistory);
  res.json({ ok: true });
}));

// Fill from history: body {projectId, taskType, taskDesc, useTaskType}
WebApp.handlers.patch('/api/times/:id/fill/set', apiHandler(async (req, res) => {
  const user = await authorizeApiRequest(req, res, 'timeFillData');
  if (!user) return;
  const { projectId, taskType, taskDesc, useTaskType } = req.body;
  await timeFillData(user, req.params.id, projectId, taskType, taskDesc, useTaskType);
  res.json({ ok: true });
}));
