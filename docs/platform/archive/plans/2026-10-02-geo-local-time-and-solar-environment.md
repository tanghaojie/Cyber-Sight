---
title: Geo 浏览器时区时间轴与太阳环境光
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-10-02
updated: 2026-10-02
---

# Geo 浏览器时区时间轴与太阳环境光

## 目标

时间轴按浏览器本地时区显示并对齐刻度；太阳环境光跟随唯一仿真 Clock，外部模型与 3D Tiles 的环境贴图按 300 秒仿真时间精度更新。

## 背景与设计依据

维护者先要求把时间轴从 UTC 改为浏览器时区，再采用已讨论的环境光最小修正。现行时间轴、模型渲染设计和 ADR 同步更新；本任务属于 Platform Geo，不修改 Foundation。

## 范围

- TimeDock 的当前时间、窗口边界、刻度标签和提示；Time controller 的本地当天窗口。
- Scene 的 SUNLIGHT 大气环境光策略；Data 创建模型和 tileset 时的环境贴图更新阈值。
- Platform 设计、ADR、实施记录与既有到期归档复核。

## 非目标

不新增 Clock、每模型计时器、用户时区选择、模型资产或真实人工光源；不调整现有夜间 IBL 0.2、自发光语义、阴影默认值和科技扫描 Shader。UTC 每日航线继续按绝对时间计算。

## 前置条件和风险

- 初始暂存区、工作区为空；基线 `71d1d65bec7cfd007bef4130fff556403bdf917d`。
- 仓库前端仅允许静态检查和生产构建；浏览器时区、夏令时和 GPU 效果由维护者人工验收。
- 夏令时日窗口可能为 23 或 25 小时；环境贴图生成是异步的，高倍速成本需要人工比较。
- 归档门禁为 DUE，另设同作用域归档复核计划；不修改 inherited Foundation 台账。

## 实施任务

- [x] 更新现行设计与 ADR，明确本地显示和绝对时间计算的边界。
- [x] 修改本地时间格式、日历刻度和当天窗口。
- [x] 启用 SUNLIGHT，配置 Model / Cesium3DTileset 环境贴图更新阈值。
- [x] 格式、lint、架构、类型与生产构建通过，完成代码 diff 审查。
- [x] 完成归档复核，归档计划和协作记录；最终格式及文档 CI 门禁通过。

## 测试与验证

不创建或运行前端自动化/浏览器测试。执行 `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、契约构建与 frontend 生产构建、`pnpm docs:archive:check:ci`。人工检查 Asia/Shanghai、Asia/Kolkata 与使用夏令时的浏览器时区，暂停拖动、播放、回到现在和昼夜环境反射。

## 发布与回滚

在任务分支交付本地提交与可应用补丁。尝试创建草稿 PR 时 GitHub 集成返回 403（Resource not accessible by integration），未能上传改动或创建 PR；不合并或部署。需要回滚时可恢复本提交的 Geo 代码和对应设计。

## 实际偏差和遗留问题

完成四个 Geo 源文件修改。契约构建、`vue-tsc`、frontend 的 Sight / Standalone Geo 双入口生产构建、lint 和架构检查通过；格式执行通过。归档后的 `pnpm format:check`、`pnpm docs:archive:check:ci` 与 diff 检查通过，文档状态为 NOT_DUE，无断链或所有权冲突。构建包含依赖 Sass 弃用与 bundle 体积提示，未影响产物生成。

静态检查不代替人工验收。浏览器时区/夏令时、暂停拖动、高倍速环境贴图成本与实际 GPU 视觉尚未验收；夜间 IBL 0.2 保留，后续根据实际模型比较调整。

关联代码提交：`231f44fb51286b2948be7f4e8353b850324b0956`（`fix(geo): use browser-local timeline and solar environment lighting`），包含 `Co-Authored-By: -AI- GPT-6 <ai@scaffold-proj.com>`。

## 相关设计、ADR 和 AI 日志

- [时间轴设计](../../design/modules/geo-unbounded-timeline.md)
- [模型渲染设计](../../design/modules/geo-model-rendering.md)
- [本地时间与太阳环境光 ADR](../../decisions/ADR-20261002-geo-browser-time-and-solar-environment.md)
- [协作记录](../ai-logs/fix/2026/10/2026-10-02-geo-local-time-and-solar-environment.md)
