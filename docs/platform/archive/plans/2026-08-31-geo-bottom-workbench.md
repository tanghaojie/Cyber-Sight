---
title: Geo 底部工作台折叠交互实施计划
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-31
updated: 2026-08-31
---

# Geo 底部工作台折叠交互实施计划

## 目标

将状态条和仿真时间轴由两张上下堆叠的浮层卡片改为一张连续的底部工作台，并让两层均可独立收起。

## 背景与设计依据

Time 插件已经通过 `bottomDocks` 注册全局时间轴，Shell 已拥有状态条开合状态。两个表面分别使用圆角、阴影和毛玻璃，视觉上缺少主次关系。时间轴是主动操作层，状态信息是次级反馈层；本次仅协调 Shell 与动态 dock 的视觉和布局状态，不改变 `viewer.clock`、太阳光照 capability 或插件业务边界。

## 范围

- 为动态 bottom dock 增加受 Shell 控制的收起状态和布局事件；
- 让 TimeDock 在完整时间轴与紧凑时间把手之间切换；
- 将展开状态条与时间轴合并为一个连续表面，并在状态搁板中隐藏相机高度；
- 补充中英文无障碍文案、设计记录与人工验收口径。

## 非目标

- 不改变时间范围、播放、拖动、倍速、太阳光照或太阳阴影行为；
- 不新增移动端/窄屏布局承诺、持久化偏好或新的插件公共 API；
- 不改变任何 Cesium Viewer 生命周期、渲染模式或 capability 依赖。

## 前置条件和风险

- Platform 文档归档检查在开始时为 `NOT_DUE`；
- Geo 仅以横向 `1280×720` 及以上为人工验收基线；
- 动态组件事件必须只反映通用的折叠布局，Shell 不得依赖 Time controller。

## 实施任务

- [x] 更新 Geo 设计，明确底部工作台的视觉层级和四种折叠组合。
- [x] 改造 Shell，向 bottom dock 提供通用布局状态并根据事件调整预留空间。
- [x] 改造 TimeDock 与状态条，提供合并外观、可访问的折叠控制和低动效降级。
- [x] 完成格式、类型/生产构建、架构与归档检查，并记录人工浏览器验收边界。

## 测试与验证

- 静态：`pnpm format`、`pnpm format:check`、前端 TypeScript/生产构建、`pnpm architecture:check`、`pnpm docs:archive:check:ci`、`git diff --check`；
- 人工：在 `1280×720` 和常用宽屏下检查四种折叠组合、键盘焦点、播放/拖动/日照阴影控制，以及 Cesium credits、侧栏和状态把手互不遮挡。

## 发布与回滚

此变更只有前端会话内布局状态；回滚为还原 Shell、TimeDock、GeoStatusBar 与本计划对应提交即可，不涉及数据库、API 或持久化数据。

## 实际偏差和遗留问题

- `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check` 与 `git diff --check` 均通过；
- 受限环境无法读取 Vite 配置，使用相同命令在授权环境重跑 `pnpm --filter @cyber-ai-forge/frontend build` 通过；构建保留既有 Sass 与 Rollup 注释警告；
- 未运行前端自动化或浏览器测试，符合 Geo 的人工浏览器验收边界。维护者仍需在真实浏览器中验证四种折叠组合、键盘焦点、时间播放/拖动、太阳光照/阴影和 Cesium credits 不重叠；
- 不涉及 ADR、API、数据模型、Cesium 时间语义或太阳光照能力的偏差。提交将使用 `feat(geo): unify collapsible bottom workbench`。

## 相关设计、ADR 和 AI 日志

- [Geo 前端空间可视化工作台](../../design/modules/geo.md)
- [Geo 时间轴与太阳光照 ADR](../../decisions/ADR-20260830-geo-simulation-time-and-solar-lighting.md)
- [本次协作记录](../../ai-logs/2026/08/2026-08-31-geo-bottom-workbench.md)
