---
title: Geo 底部工作台折叠交互
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-31
status: completed
---

# Geo 底部工作台折叠交互

## 用户目标和约束

用户认为底部状态栏和时间轴同时出现时视觉效果欠佳，要求两者均可折叠，并确认直接实现。

## 关键问答与确认

- 先提出的一体化底部工作台方案被用户接受；
- 时间轴继续是主操作层，状态栏是次级信息搁板；
- 不改变既有太阳光照/阴影范围、唯一 `viewer.clock` 或插件能力边界。

## AI 的重要假设

- Geo 的桌面 `1280×720` 基线不变；
- 当前只有 Time 插件提供 bottom dock，但 Shell 的折叠事件保持通用，避免把 Time controller 引入 Shell；
- 折叠状态仅存于当前页面会话，不引入偏好持久化。

## 方案和执行摘要

- Shell 以动态组件通用 props 向 bottom dock 传递 `collapsed` 和 `joinedWithStatus`，并只消费 `update:collapsed` 布局事件；Time controller 未进入 Shell；
- TimeDock 展开时保留播放、回到现在、UTC 时间、倍速、拖动和日照/阴影；收起时保留播放、UTC 时间、倍速和可访问展开按钮；
- 状态条与展开 dock 合并为一张连续表面，状态搁板隐藏相机高度；状态条收起时 dock 恢复独立外框，两者均收起时时间把手收窄。

## 验证结果

- `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、`git diff --check` 通过；
- 授权环境的 `pnpm --filter @cyber-ai-forge/frontend build` 通过，保留既有 Sass 与 Rollup 注释警告；
- 依照仓库前端边界，未运行自动化或浏览器测试；人工验收待维护者检查桌面视口下四种折叠组合和地图交互不受影响。

## 未决问题与下一步

维护者需要在真实浏览器与 GPU 环境完成人工视觉和交互验收。

## 相关设计、ADR、计划和提交

- [Geo 前端空间可视化工作台](../../../design/modules/geo.md)
- [实施计划](../../../plans/active/2026-08-31-geo-bottom-workbench.md)
- 提交：`feat(geo): unify collapsible bottom workbench`
