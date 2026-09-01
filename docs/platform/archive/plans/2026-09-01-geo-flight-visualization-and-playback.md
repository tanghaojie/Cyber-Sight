---
title: Geo 航班视图、航线与播放联动
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-09-01
updated: 2026-09-01
---

# Geo 航班视图、航线与播放联动

## 目标

改善离线模拟航班的可见性和操控：开启航班时开始共享时间轴播放并框选所有航线，扩展为 30 条航线，以与飞机一致的三维高度渲染航线，使用适合深色地图的多色航线/飞机，并支持仅显示飞机。

## 背景与设计依据

Geo 只使用 `viewer.clock` 作为仿真时间源。Flight 通过 Time 的最小公开能力启动播放，不导入 Time controller；Flight 仍是本地、每日循环的模拟数据，不接入真实 ADS-B 数据。现行设计见 `docs/platform/design/modules/geo.md`、`geo-unbounded-timeline.md` 和两份 Geo 时间/航班 ADR。

## 范围

- Time 插件发布仅含 `setPlaying` 的播放能力，Flight 显式依赖并使用该能力；
- 30 条内置国内及周边模拟航线，启用时框选整个航线集合；
- 基于同一测地线和高度剖面的飞机位置与三维航线；
- 多色航线与对应飞机图标，以及左侧面板的航线可见性开关；
- 更新 Geo 设计、计划、协作记录和归档审查闭环。

## 非目标

- 不添加第二个 Clock、真实航班服务、存储、后端接口或新的自动化前端测试；
- 不改变太阳光照、地图底图或其他 Geo 插件。

## 前置条件和风险

航线高度是物理合理的模拟巡航高度，并非实时 ADS-B 高度。相机框选须以全部路线的三维点集计算，避免依赖当前时刻是否有飞机可见。

## 实施任务

- [x] 发布 Time 播放 capability，并将 Flight 依赖固定为 `time`。
- [x] 重建模拟航线层、30 条数据、三维路径、多色飞机和全路线取景。
- [x] 加入航线可见性状态与左侧面板控制。
- [x] 更新当前设计和协作记录，启动文档归档审查。

## 测试与验证

- `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、前端生产构建、`pnpm docs:archive:check:ci` 与 `git diff --check`；
- 维护者人工验收：启用后播放和取景、30 条航线、航线与飞机高度对齐、颜色辨识度、隐藏航线仅保留飞机、重复开关无残留实体。

## 发布与回滚

此变更只影响前端会话内的 Geo 模拟实体。回滚本提交即可恢复原有 8 条航线和手动时间播放行为。

## 实际偏差和遗留问题

`pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、`git diff --check` 和授权环境中的 `pnpm --filter @cyber-ai-forge/frontend build` 已通过。构建保留既有 Sass/依赖注释与 Geo chunk 体积警告。仓库不运行前端浏览器自动化；三维高度、取景、颜色和隐藏航线需要维护者按本计划人工验收。

## 相关设计、ADR 和 AI 日志

- [Geo 前端空间可视化工作台](../../design/modules/geo.md)
- [Geo 无界时间轴与每日循环航线方案](../../design/modules/geo-unbounded-timeline.md)
- [单一仿真时间与太阳光照 ADR](../../decisions/ADR-20260830-geo-simulation-time-and-solar-lighting.md)
- [模拟航班数据 ADR](../../decisions/ADR-20260831-geo-simulated-flight-data.md)
- [AI 协作记录](../ai-logs/2026/09/2026-09-01-geo-flight-visualization-and-playback.md)
