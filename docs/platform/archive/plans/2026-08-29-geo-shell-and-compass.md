---
title: Geo 外壳精简与指南针交互修复
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-29
updated: 2026-08-29
---

# Geo 外壳精简与指南针交互修复

## 目标

删除 Geo 页面没有有效操作价值的顶栏，并将右上静态指南针改为反映真实相机 heading、可点击回正的地图控件。

## 背景与设计依据

原 `GeoTopBar` 只重复展示页面、场景和本地会话文案，其中场景按钮没有行为。`GeoMapControls` 的指南针只是不可交互的 CSS 图形，不消费 Cesium 相机状态。现行 Geo 设计坚持地图优先、渐进披露、状态明确，因此删除重复外壳并让指南针承担真实地图反馈。

## 范围

- 删除 Geo 页面对 `GeoTopBar` 的渲染、组件和专用本地化文案。
- 在页面级 `GeoRuntime` 中同步相机 heading，并提供只回正朝向的操作。
- 将指南针改为可访问按钮，按 heading 旋转并点击回正。
- 同步 Geo 设计、计划、AI 协作记录和目录索引。

## 非目标

- 不改变相机复位的上海初始视图。
- 不修改 Geo 插件架构、数据图层、场景配置或渲染性能策略。
- 不新增或运行前端自动化及浏览器测试。

## 前置条件和风险

- 暂存区和工作区在任务开始时为空；初始文档归档审计为 `NOT_DUE`。
- 回正保留相机当前位置和俯仰角，避免与复位相机产生重复或突兀跳转。
- 相机 heading 由 Cesium `camera.changed` 驱动；监听继续由页面运行时作用域释放。

## 实施步骤

1. 更新 Geo 设计，冻结顶栏删除与指南针交互语义。
2. 调整运行时相机状态和地图控件，删除顶栏与无用文案。
3. 执行格式、类型、构建、架构和文档门禁，检查最终差异。
4. 归档完成计划与 AI 日志并创建带 AI trailer 的提交。

## 测试与验证

- `pnpm format`：通过。
- `pnpm format:check`：通过。
- `pnpm lint`：通过。
- `pnpm --filter @cyber-ai-forge/frontend build`：`vue-tsc` 与生产构建通过；沙箱内 Vite/esbuild 命中 Windows 文件访问限制，授权环境原样重跑后通过。
- `pnpm architecture:check`：通过。
- `pnpm docs:archive:check:ci`：修正活动 AI 日志的两个相对链接后通过，结果为 `NOT_DUE`。
- 按仓库边界未运行前端自动化或浏览器测试。维护者人工验收范围：旋转/倾斜相机时指南针方向实时变化；点击指南针后正北朝上且位置、俯仰角保持；桌面与窄屏不再出现 Geo 顶栏。

## 回滚方案

恢复 `GeoTopBar` 渲染与组件，并回退运行时 heading 状态、回正方法和指南针按钮即可；不涉及数据迁移。

## 实际偏差和遗留问题

实现按设计完成。删除顶栏后同时把桌面工具轨、上下文面板、检查器和地图控制的顶部偏移从 `96px` 收紧到 `22px`，窄屏地图控制收紧到 `12px`，避免保留无意义空区。真实 Cesium 交互仍需维护者人工验收。

## 相关设计、ADR 和 AI 日志

- [Geo 前端空间可视化工作台](../../design/modules/geo.md)
- [Geo 前端编译期插件架构](../../decisions/ADR-20260814-geo-frontend-plugin-architecture.md)
- [AI 协作记录](../ai-logs/2026/08/2026-08-29-geo-shell-and-compass.md)
- 关联提交：`feat(geo): fix compass interaction`
