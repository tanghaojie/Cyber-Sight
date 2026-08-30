---
title: Geo 横向宽屏布局收敛
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-30
updated: 2026-08-30
---

# Geo 横向宽屏布局收敛

## 目标

把 Geo 的运行环境正式收敛为横向宽屏，并删除此前为窄屏、竖屏和手机保留的响应式布局代码，使现行设计、实现和人工验收边界一致。

## 背景与设计依据

维护者确认 Geo 只会在横向宽屏使用，不需要考虑窄屏适配。现行设计仍声明手机基础能力保证，Shell 组件也包含 `560px`、`760px`、`1024px` 和 `1120px` 宽度断点，已与产品使用边界冲突。现有人工验收项已把 `1280×720` 作为明确桌面基线，本次据此定义最低支持视口。

## 范围

- 更新 `docs/platform/design/modules/geo.md`，声明仅支持横向 `1280×720` 及更宽桌面视口；
- 移除 Geo 页面和 Shell 组件中按视口宽度触发的隐藏、重排、缩窄和字段裁剪规则；
- 保留减少动效、低高度任务轨压缩和 Viewer 尺寸变化重算等与窄屏兼容无关的规则；
- 完成格式、TypeScript、生产构建、架构和文档归档门禁验证。

## 非目标

- 不重新设计 Geo 的桌面视觉或功能；
- 不修改 Cesium 运行时、插件、工具算法或业务状态；
- 不新增窄屏阻塞页、设备识别或移动端提示；
- 不创建或运行前端自动化、端到端或浏览器测试。

## 前置条件和风险

- 任务开始时暂存区和工作区必须为空；
- `pnpm docs:archive:check` 必须在首次修改前返回可继续状态；
- 小于 `1280×720` 的视口可能出现遮挡或内容超出视口，这是明确的不支持边界，不属于回归；
- 静态检查和生产构建不能代替维护者在真实 Cesium 页面上的横向宽屏人工验收。

## 实施任务

- [x] 核对 Geo 现行设计、活动计划和所有宽度响应式规则；
- [x] 更新设计并冻结横向宽屏支持边界；
- [x] 删除窄屏媒体查询和为视口宽度缩窄的尺寸表达式；
- [x] 检查 Geo 模块不再存在窄屏专用宽度断点；
- [x] 完成静态验证、记录实际结果并归档本计划与 AI 协作记录；
- [x] 创建带真实模型 trailer 的 Git 提交。

## 测试与验证

- `pnpm format`
- `pnpm format:check`
- 前端 TypeScript 检查与生产构建
- 仓库架构检查
- `pnpm docs:archive:check:ci`
- 维护者人工验收横向 `1280×720` 与常用更宽桌面视口；不验收窄屏、竖屏、平板或手机

## 发布与回滚

本次随 Cyber-Sight 前端常规发布，无数据迁移。需要恢复窄屏支持时，必须重新定义支持矩阵、交互降级和人工验收范围，而不是只恢复零散媒体查询。

## 实际偏差和遗留问题

- 共删除 9 个按视口宽度触发的媒体查询，并把 3 个带 `100vw` 的面板宽度表达式恢复为桌面固定宽度；
- `GeoToolRail` 原有低高度规则从“低高度且非窄屏”收敛为单纯的 `max-height: 720px`，继续服务 `1280×720` 最低基线；
- `pnpm format`、`pnpm format:check`、`pnpm lint`、前端 `vue-tsc && vite build`、`pnpm architecture:check` 和最终 `pnpm docs:archive:check:ci` 均通过；
- 前端构建首次在受限 Windows 环境因 Vite/esbuild 无权读取父目录失败，授权环境重跑同一命令后通过；构建仍有既存 Sass legacy API、`AdminLayout` 动静态导入和 Geo 大 chunk 警告；
- 按仓库边界未创建或运行前端自动化、端到端或浏览器测试；横向 `1280×720` 与常用更宽桌面视口仍需维护者人工验收。

## 相关设计、ADR 和 AI 日志

- [Geo 前端空间可视化工作台](../../design/modules/geo.md)
- [AI 协作记录](../ai-logs/2026/08/2026-08-30-geo-wide-screen-only.md)
- 本次不新增 ADR：支持设备范围属于 Geo 产品设计边界，不改变现有插件或架构决策。
- 关联提交：`feat(geo): remove narrow-screen layout`
