---
title: Geo 模拟航线完整连线与飞机图标
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-31
updated: 2026-08-31
---

# Geo 模拟航线完整连线与飞机图标

## 目标

修复模拟航班只显示有限动态轨迹的问题，使每条航线始终完整连接起点、终点，并用飞机图标替代当前位置圆点。

## 范围

- 在现有独立 `CustomDataSource` 内为每条航线新增完整的大圆线；
- 保持 `viewer.clock`、位置插值和资源清理边界不变；
- 以随前端发布的内置 SVG 飞机图标展示活动航空器；
- 同步当前设计、决策、协作记录与人工验收项。

## 非目标

- 不接入网络、后端或真实航班数据；
- 不新增第二个 Clock、逐帧手动定位或前端自动化测试；
- 不引入外部图片资产或额外依赖。

## 实施任务

- [x] 以完整大圆线连接每条模拟航线的起点和终点；
- [x] 将活动航空器点位替换为内置飞机图标；
- [x] 格式化、构建、文档门禁与人工验收交接。

## 验证与人工验收

- `pnpm format`、`pnpm format:check`、`pnpm architecture:check`、`pnpm docs:archive:check:ci` 和 `git diff --check` 通过；
- 授权环境下的 `pnpm --filter @cyber-ai-forge/frontend build` 和 `pnpm lint` 通过；
- 前端自动化与浏览器测试依仓库规则未运行。维护者需确认：启用模拟航班后，每条青色航线完整接到其起点和终点，移动位置为飞机图标而非圆点，播放、暂停、拖动时间轴后图标继续沿航线移动。
