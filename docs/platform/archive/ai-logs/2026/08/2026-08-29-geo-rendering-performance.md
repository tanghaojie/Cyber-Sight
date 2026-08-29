---
title: Geo 渲染性能优化
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-29
status: completed
---

# Geo 渲染性能优化

## 用户目标和约束

用户要求先实施自适应 `resolutionScale`、空闲按需渲染和鼠标拾取节流，再把本地后端端口改为 `5000`、前端端口改为 `5555`；明确允许直接修改配置文件。

## 关键问答与确认

- 不创建或运行前端自动化测试；使用类型检查、生产构建、静态覆盖检查和维护者人工验收边界。
- 本地分层环境文件可以修改，但不得记录或输出其中的凭据和其他配置值。

## AI 的重要假设

- “配置文件”指当前仓库已经使用的 `apps/frontend/env/.env.foundation.local` 与 `apps/backend/env/.env.foundation.local`，而不是修改 Forge 所有的 Foundation 默认值。
- 现有 Geo 功能都必须兼容显式渲染；不能只打开 Viewer 选项而忽略动画和直接场景写入。

## 方案和执行摘要

- 暂存区硬门禁通过，任务开始时工作区干净。
- 文档归档审计为 `NOT_DUE`。
- 运行时诊断确认主要瓶颈随画布像素数变化，UI 模糊层、默认本地影像和插件循环不是第一主因。
- 计划以像素预算确定初始渲染比例上限，再用有效连续帧的小步调节适应运行设备；显式渲染使用无限仿真时间阈值并由直接场景写入主动请求新帧。
- 实现新增页面级渲染性能控制器；状态栏拾取限制为约 `20 Hz` 并在相机移动时暂停，FPS 统计在空闲或后台时清空。
- 场景设置、数据资源、影像图层、标绘/测量动态预览、地形动画、模型工具和影像分屏均补齐 `scene.requestRender()`。
- 本地前端端口改为 `5555`，后端与前端代理目标端口改为 `5000`；本地环境文件仍保持 Git 忽略状态。

## 验证结果

- `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check` 与 `pnpm docs:archive:check:ci` 通过。
- 前端 `vue-tsc` 和生产构建通过；沙箱内 Vite/esbuild 因 Windows 文件访问限制失败，按仓库经验在授权环境重跑同一命令后通过。
- Vite 实际监听 `http://127.0.0.1:5555/`；后端实际监听 `5000`，`GET /health` 返回 `200`，验证后两个临时服务均已停止。
- 后端启动时本地 PostgreSQL `5432` 未运行，既有 API 日志保留清理记录 `ECONNREFUSED`；没有影响健康检查或端口结论。
- 构建继续提示 Sass legacy API、Geo 大 chunk 和 `AdminLayout` 动静态导入；均为既有提示。

## 未决问题与下一步

- 按仓库前端验证边界未运行浏览器自动化；维护者最终人工验收需要覆盖相机、场景开关、图层、标绘、测量、地形淹没、模型处理与分屏滑块。

## 相关设计、ADR、计划和提交

- [Geo 前端空间可视化工作台](../../../../design/modules/geo.md)
- [Geo 渲染性能优化计划](../../../../archive/plans/2026-08-29-geo-rendering-performance.md)
- 关联提交：`feat(geo): optimize rendering performance`
