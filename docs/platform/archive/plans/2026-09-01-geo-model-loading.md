---
title: Geo 外部 glTF 加载状态与自动定位修复
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-09-01
updated: 2026-09-01
---

# Geo 外部 glTF 加载状态与自动定位修复

## 目标

修复 Geo 数据面板加载外部 glTF/GLB 时缺少明确 loading 反馈、模型尚未 ready 就读取包围球导致的 Cesium 提示，以及加载完成后自动飞行失败的问题。

## 背景与设计依据

- `docs/platform/design/modules/geo.md`：Geo 数据插件、模型资源生命周期和浏览器人工验收边界。
- Cesium `Model` 契约：只有 `ready === true` 后才能安全读取模型包围球并执行相机定位。
- `AGENTS.md`：Platform 模块边界、前端不创建自动化测试、完成后归档计划与 AI 日志。

## 范围

- 在数据 controller 中发布模型加载阶段，供外部数据面板显示 loading 状态。
- 在纯 Cesium 数据浏览器中将模型加入场景后等待 `Model.readyEvent` / `Model.ready`，再返回模型资源。
- 保持 controller 现有“加载成功后自动 `flyTo`”行为，并使手动定位同样遵守 ready 前置条件。
- 更新 Geo 设计、实施记录和人工验收项。

## 非目标

- 不新增 glTF 上传、服务端代理、模型缓存或持久化。
- 不改变模型坐标、旋转、缩放和阴影参数语义。
- 不创建或运行前端自动化、端到端或浏览器测试。

## 前置条件和风险

- 模型 ready 事件依赖 Cesium 场景帧推进；显式渲染模式下必须请求场景重绘。
- 网络、CORS、glTF 外部引用或 WebGL 失败仍按现有数据操作错误展示，并必须清理未完成的 Primitive。
- 静态门禁不能证明真实外部模型、GPU 渲染和相机飞行效果，需维护者在浏览器中人工验收。

## 实施任务

- [x] 扩展 Geo 数据状态，区分模型加载操作并在外部数据面板提供可访问的 loading 反馈。
- [x] 等待 Cesium Model ready 后再发布资源和读取包围球，保留取消与失败清理。
- [x] 更新设计文档和人工验收矩阵，完成格式、类型、架构、构建和归档检查。
- [x] 归档本计划与 AI 协作记录并提交带真实模型名称 trailer 的 Git 提交。

## 测试与验证

- `pnpm format`
- `pnpm format:check`
- `pnpm lint`
- `pnpm architecture:check`
- `pnpm --filter @cyber-ai-forge/frontend build`
- `pnpm docs:archive:check:ci`
- `git diff --check`
- 人工：真实可访问 glTF/GLB 加载期间显示 loading；加载成功后无 Model 未加载提示且自动飞到模型；模型卡片可再次定位、调整和移除；失败后无残留 Primitive。

## 发布与回滚

按现有 Platform 前端发布流程交付。若人工验收发现 Cesium 版本差异导致 ready 事件无法完成，可回滚本次提交；不得通过绕过 ready 检查恢复旧的包围球读取路径。

## 实际偏差和遗留问题

已完成代码和静态验证；生产构建首次在受限 Windows 环境被 esbuild 拒绝读取 Vite 配置，授权环境用同一命令通过。真实外部模型、GPU 渲染和相机飞行仍待维护者浏览器人工验收。

## 相关设计、ADR 和 AI 日志

- `docs/platform/design/modules/geo.md`
- `docs/platform/archive/ai-logs/2026/09/2026-09-01-geo-model-loading.md`
- 关联提交：`fix(geo): stabilize external glTF loading`（本提交）。
