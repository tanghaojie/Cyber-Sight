---
title: Geo 拍摄模块与逐帧输出实施计划
scope: platform
repository: Cyber-Sight
status: completed
owner: project maintainers
date: 2026-10-19
---

# Geo 拍摄模块与逐帧输出

用户授权完成此前讨论的专门拍摄模块。开始时暂存区、工作区为空，归档审计 NOT_DUE；不涉及 Foundation 或远端发布。

1. [x] 阅读现有 Geo 相机、时间、渲染、动画与插件边界，编写设计和 ADR。
2. [x] 实现版本化工程、四类模板、局部机位、五次平滑/匀速插值与持久化校验。
3. [x] 增加 Data 主体/动画采样公共端口，统一拍摄会话与恢复。
4. [x] 完成拍摄面板、净画面、路径、预览、工程库与 JSON 导入导出。
5. [x] 完成固定分辨率逐帧 MP4 / PNG ZIP、单镜头/整片/批次、首尾静止余量、取消与恢复。
6. [x] 格式、类型、全仓 lint、生产构建、架构与归档 CI 通过；人工验收边界见指南。
7. [x] 更新最终设计、归档计划/日志；本计划随 `feat(geo): add capture studio and frame-by-frame export` 提交交付，trailer 由提交后检查验证。

## 实际验证与边界

前端 `vue-tsc && vite build` 通过，最终生产构建 42.28 秒，Sight / Standalone Geo 两个入口均生成；全仓 `pnpm lint`、`pnpm format:check`、`pnpm architecture:check`、`pnpm docs:archive:check:ci`（NOT_DUE）及 `git diff --check` 通过。构建仍报告现有 Sass legacy API、第三方 PURE 注释和大 chunk 提示。

按 AGENTS.md 未创建或运行前端/浏览器自动化；实际 GPU、编码、资源加载和视觉由维护者按[指南](../../guides/geo-capture.md)人工验收。导出保留当前场景效果，只锁定绘图像素；普通下载限 256 MB，支持文件 API 时流式写盘，PNG ZIP 单文件限 3 GB。无自动避障、形态权重动画采样、音轨或跨设备像素一致保证。

关联：[设计](../../design/modules/geo-capture.md)、[决策](../../decisions/ADR-20261019-geo-capture.md)。

功能提交 `70bfe5c` 后，门禁检测到架构即时触发项，另行完成[Platform 文档复核](2026-10-19-geo-capture-archive-review.md)并推进真实基线；上述 NOT_DUE 为功能提交前的实际检查结果。
