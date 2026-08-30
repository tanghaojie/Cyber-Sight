---
title: Geo 时间轴与太阳光照实施计划
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-30
updated: 2026-08-31
---

# Geo 时间轴与太阳光照实施计划

## 目标

在 Geo 工作台中实现自定义底部时间轴，以唯一的 `viewer.clock` 驱动仿真时间，并实现太阳光照与可选太阳阴影。

## 背景与设计依据

Cesium Viewer 已关闭原生 `animation` 和 `timeline` 控件，但仍保留 Clock。当前 Scene 插件已经具备地球光照和 ShadowMap 设置，本计划收敛它们的跨插件端口并与自定义时间轴组合。

## 范围

- 扩展 Geo 插件注册表的 `bottomDocks` contribution；
- 新增 Time 插件、controller 和时间轴组件；
- 使用当天 UTC 24 小时循环范围，支持播放/暂停、拖动、回到当前时刻与倍速；
- Scene 插件发布太阳光照 capability；
- 时间轴提供太阳光照和太阳阴影独立开关；
- 更新 Geo 设计、ADR、索引和 AI 协作记录。

## 非目标

- 不启用 Cesium 原生 Animation/Timeline 控件；
- 不实现月光、天气、人工光源、大气散射模拟或阴影质量档位；
- 不实现飞机、航线、事件标记、跨日业务时间范围或状态持久化；
- 不创建或运行前端自动化/浏览器测试。

## 前置条件和风险

- `viewer.clock` 必须保持唯一时间源；
- 播放态需要持续请求渲染，阴影可能显著增加 GPU 成本；
- 太阳与阴影的真实视觉效果必须由维护者在浏览器和不同场景数据下人工验收。

## 实施任务

- [x] 扩展并验证 `bottomDocks` contribution 注册与渲染。
- [x] 实现 Time controller 对 `viewer.clock` 的初始化、同步和释放。
- [x] 实现暗色底部时间轴及其无障碍标签。
- [x] 发布并消费太阳光照 capability，默认开启光照、默认关闭阴影。
- [x] 完成格式、TypeScript、构建、架构与文档门禁。
- [x] 补充人工验收矩阵、归档计划与 AI 日志并创建提交。

## 测试与验证

- `pnpm format`
- `pnpm format:check`
- 前端 TypeScript 检查与生产构建
- 现有架构检查
- `pnpm docs:archive:check:ci`
- 人工验收：UTC 范围、拖动、播放/暂停、各倍速、跨边界循环、回到当前时刻、太阳明暗、阴影开关、页面重复进入/退出。

## 发布与回滚

改动只影响 Geo 前端懒加载 chunk，不涉及后端、契约、数据库或迁移。回滚时整体撤销 Time 插件、`bottomDocks` contribution 和 Scene capability 即可，原有 Scene 面板仍保持独立。

## 实际偏差和遗留问题

- 实现与设计范围一致；额外关闭了 DataSource 自动接管 Clock，以保证 `viewer.clock` 的唯一所有权。
- `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、前端 `vue-tsc && vite build`、`git diff --check` 和 `pnpm docs:archive:check:ci` 均通过。
- 前端生产构建仅保留仓库既有的 Sass legacy API、Rollup PURE 注释、动态/静态重复导入和 Geo 大 chunk 警告；本次 Geo chunk 约 `4,311.20 kB`，gzip 约 `1,168.63 kB`。
- 按仓库规则未运行前端自动化或浏览器测试。UTC 时间轴交互、太阳明暗、阴影质量、GPU 成本和重复进出页面后的资源释放仍由维护者人工验收。

## 相关设计、ADR 和 AI 日志

- [Geo 前端空间可视化工作台](../../design/modules/geo.md)
- [Geo 单一仿真时间与太阳光照 ADR](../../decisions/ADR-20260830-geo-simulation-time-and-solar-lighting.md)
- [AI 协作记录](../ai-logs/2026/08/2026-08-30-geo-time-and-solar-lighting.md)
