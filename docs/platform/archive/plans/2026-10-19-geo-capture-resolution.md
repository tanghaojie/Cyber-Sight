---
title: Geo 导出画布分辨率修复
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-10-19
updated: 2026-10-19
---

# Geo 导出画布分辨率修复

## 目标与依据

修复维护者在 1080p 竖屏（1080×1920）导出时报告的“浏览器未能保持指定输出分辨率”错误。依据 [拍摄设计](../../design/modules/geo-capture.md)，保持目标像素输出与失败恢复，不通过缩放输出画面绕过检查。

## 范围与非目标

只修改 Platform Geo 的导出画布尺寸控制与错误信息。不修改视频编码、工程格式、Foundation 或既有画质预设，不新增依赖。

## 证据与风险

当前导出通过修改 `viewer.container.style` 调整尺寸，该容器也由 `GeoWorkspacePage.vue` 的 `mapFrameStyle` 管理。本地 Cesium 源码 `configureCanvasSize` 从 canvas 的 `clientWidth/clientHeight` 计算输出像素，而非直接读取 Viewer 外层容器。结构上存在布局争用，用户环境的实际尺寸尚待人工复验；设备的绘图缓冲分配上限仍可能导致失败。

## 实施任务

- [x] 检查暂存区、工作区、现行设计与归档状态（NOT_DUE）。
- [x] 更新设计并创建实施计划与 AI 协作记录。
- [x] 临时固定实际渲染 canvas 的 CSS 尺寸，移除外层容器样式覆盖。
- [x] 渲染前更新尺寸，采集前检查 canvas 与绘图缓冲，补充实际尺寸错误信息。
- [x] 执行格式、类型、ESLint、生产构建、架构和归档检查。
- [x] 归档计划与 AI 日志，随本轮修复提交；提交后核对 AI trailer 与工作区。

## 测试与验证

遵守前端验证边界，不创建或运行前端及浏览器自动化测试。人工复验覆盖 1080p/4K 横竖屏、预览后导出、窗口尺寸变化、MP4/PNG、取消与失败后的样式和浏览恢复。静态门禁不代表实际 GPU 或编码验收通过。

## 发布与回滚

交付本地提交；必要时回退本次修复提交。保留严格目标尺寸检查，不自动降低分辨率。

## 实际结果和关联

已直接固定实际 canvas 的 CSS 宽高并恢复原样式，移除对 Vue 容器样式的覆盖；渲染前 resize，检查 canvas 和实际绘图缓冲，失败时输出三组尺寸，不拉伸低分辨率源画面。

通过 `pnpm format`、`pnpm format:check`、修改文件 ESLint、`pnpm --filter @cyber-ai-forge/frontend build`（含 Vue/TypeScript）、`pnpm architecture:check`、`pnpm docs:archive:check:ci`（NOT_DUE）及 `git diff --check`。构建保留 Sass 旧 API 和大分包提示，未出现构建错误。无实现范围偏差；1080×1920 的用户现场导出与 GPU/编码结果仍待维护者复验。

关联 [AI 协作记录](../ai-logs/fix/2026/10/2026-10-19-geo-capture-resolution.md)。实现与归档随本记录同一提交 `fix(geo): lock capture render canvas dimensions`，具体 SHA 由本文件 Git 历史追溯。
