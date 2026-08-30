---
title: Geo 时间轴与太阳光照协作记录
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-30
status: completed
---

# Geo 时间轴与太阳光照协作记录

## 用户目标和约束

- 根据此前讨论开始实现 Geo 时间轴与动态光照；
- 光照范围只实现太阳光照与阴影；
- 遵守 Geo 前端人工验收边界和仓库文档、格式、提交门禁。

## 关键问答与确认

- 复用此前确认的单一 `viewer.clock` 方案；
- 保持 Cesium 原生 Animation/Timeline 隐藏；
- 阴影与基础太阳光照分开控制。

## AI 的重要假设

- 首版采用当天 UTC 24 小时循环范围并明确标注 UTC；
- 太阳光照默认开启，阴影因 GPU 成本默认关闭；
- 本轮不提前实现 Flight 或事件标记。

## 方案和执行摘要

- 任务开始时暂存区和工作区为空；
- `pnpm docs:archive:check` 返回 Platform `NOT_DUE`；
- 扩展 `bottomDocks` contribution，由工作台按注册表动态渲染 Time 组件；
- Time controller 配置唯一 `viewer.clock` 的 UTC 当日范围、循环、倍速、拖动、播放/暂停、回到当前时刻和清理；
- Viewer 关闭 DataSource 自动接管 Clock；
- Scene 通过 `scene.solarLighting` capability 提供太阳光照和阴影控制，Time 不穿透 Scene controller；
- 太阳光照默认开启、阴影默认关闭，播放时请求渲染，暂停后恢复空闲显式渲染。

## 验证结果

- `pnpm format`：通过；
- `pnpm format:check`：通过；
- `pnpm lint`：通过；
- `pnpm architecture:check`：通过；
- `pnpm --filter @cyber-ai-forge/frontend build`：沙箱内因 Windows 目录读取权限失败，授权环境原样重跑后 `vue-tsc` 与 Vite 生产构建通过；
- `git diff --check`：通过；
- `pnpm docs:archive:check:ci`：Platform `NOT_DUE`；
- 按仓库边界未运行前端自动化或浏览器测试，人工验收项保留在实施计划。

## 未决问题与下一步

- 真实浏览器中的太阳明暗、阴影质量和 GPU 成本由维护者人工验收；
- Flight、跨日范围和事件标记留待后续独立阶段。

## 相关设计、ADR、计划和提交

- [Geo 设计](../../../../design/modules/geo.md)
- [Geo 单一仿真时间与太阳光照 ADR](../../../../decisions/ADR-20260830-geo-simulation-time-and-solar-lighting.md)
- [实施计划](../../../plans/2026-08-30-geo-time-and-solar-lighting.md)
- 关联提交：本轮 `feat(geo): add timeline and solar lighting` AI 自动提交。
