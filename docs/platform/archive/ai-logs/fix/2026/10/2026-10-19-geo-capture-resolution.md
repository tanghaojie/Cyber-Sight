---
title: Geo 导出画布分辨率修复
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-10-19
status: completed
change_type: fix
---

# Geo 导出画布分辨率修复

## 用户目标和约束

维护者报告导出失败，错误为“浏览器未能保持指定输出分辨率，请降低分辨率后重试。”按既有任务上下文定位并修复；遵守人类内容优先、前端人工验收边界与自动提交规则。

维护者补充确认：失败设置为 1080p 竖屏，目标为 1080×1920。

## 证据与重要假设

- 任务开始暂存区和工作区为空，归档检查为 NOT_DUE。
- CodeGraph 未定位新增拍摄代码，改为读取当前文件；没有重新索引。
- 导出当前只设置外层容器宽高，该容器同时由 Vue 的预览画幅样式管理；本地已安装 Cesium 的 `configureCanvasSize` 以 canvas CSS 尺寸计算像素。
- 布局争用是本次消除的缺陷来源；未读取实际浏览器尺寸，不宣称已在用户设备复现。设备分配限制通过实际尺寸诊断继续区分。

## 方案和执行摘要

按 [拍摄设计](../../../../../design/modules/geo-capture.md) 直接固定实际渲染 canvas 的临时 CSS 尺寸，渲染前 resize，采集前严格检查画布和绘图缓冲；退出恢复原样式。保留现有分辨率租约、编码与逐帧流程。采集使用原始像素复制，不以缩放绕过尺寸检查。

## 验证结果

- `pnpm format`、`pnpm format:check`：通过。
- 修改文件 ESLint：通过。
- `pnpm --filter @cyber-ai-forge/frontend build`：通过，包含 Vue/TypeScript；Vite 完成构建，保留 Sass 旧 API 与大分包提示。
- `pnpm architecture:check`：通过。
- `pnpm docs:archive:check:ci`：NOT_DUE，通过。
- `git diff --check`：通过。

按仓库边界未创建或运行前端及浏览器自动化测试；未声称实际导出或视频视觉验收通过。

## 未决问题与下一步

实际横竖屏 MP4/PNG 输出与取消恢复由维护者人工验收。

## 关联计划和提交

[实施计划](../../../../plans/2026-10-19-geo-capture-resolution.md)。实现与归档提交为本记录所在的 `fix(geo): lock capture render canvas dimensions`，具体 SHA 由 Git 历史追溯；提交后核对真实模型 trailer 与工作区。
