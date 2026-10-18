---
title: Geo 已加载资源动画控制
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-10-18
status: completed
change_type: feat
---

# Geo 已加载资源动画控制

## 用户目标和约束

维护者要求在 Geo 外部数据“已加载数据”的控制按钮区，仅对带动画的模型显示播放入口，点击打开控制面板。沿用前端人工验收规则；没有要求升级 AIModels 发布协议或执行浏览器测试。

## 方案与重要假设

以当前实际加载的 glTF 为判断依据，不猜测独立动画 URL。Model ready 后保留默认姿态；用户主动播放才激活选中片段。模型局部进度独立于场景时钟，面板提供暂停、重播、进度、速度和循环。纯工具持有 Cesium 句柄与 RAF，controller 持有资源快照，Vue 只负责展示命令。

## 执行与验证

开始时暂存区和工作区为空；CodeGraph 优先查询后检查直接相关源码。文档归档状态 NOT_DUE。已读取现行外部数据、AIModels、DEV 预览和动画制作契约，按本次明确委托扩展普通模型播放能力。

已完成 glTF 片段元数据、单片段控制、局部 RAF 秒数、暂停/重播/进度/速度/循环、资源隐藏/后台暂停及移除清理。资源快照包含动画状态，动画进度通知仅更新资源，不触发影像列表同步。UI 条件显示入口并内嵌控制面板，普通加载不激活动画、不改变初始姿态。没有改动 DEV 特定照明与配色路径。

已通过 `vue-tsc --noEmit`、`pnpm --filter @cyber-ai-forge/frontend build`、5 个修改源码文件的 ESLint、`pnpm format`、`pnpm architecture:check` 与 `pnpm docs:archive:check:ci`。初次 lint 的 3 处 curly 规则已修正后重跑通过。生产构建只有既有 Sass 弃用、VueUse 注释及包体积提示。最终文档归档后再检查格式、归档 CI 和相对链接。不把静态构建当作浏览器验收。

起点提交 `4d950980d88af7eca24e86ebdcd0f931e58e0baf`；本轮以 `feat(geo): add loaded model animation controls` 提交关联实现、设计与证据，使用 `Co-Authored-By: -AI- GPT-6 <ai@scaffold-proj.com>` 标记。

## 未决与下一步

浏览器功能、视觉和目标设备性能由维护者人工验收。静态望京 SOHO 无播放按钮；独立 assembly/explode GLB 可通过模型 URL 加载后识别。

## 关联

- [设计](../../../../../design/modules/geo-model-animation.md)
- [计划](../../../../plans/2026-10-18-geo-model-animation.md)
- [ADR](../../../../../decisions/ADR-20261018-model-animation-controls.md)
