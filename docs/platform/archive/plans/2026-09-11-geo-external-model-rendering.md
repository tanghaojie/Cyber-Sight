---
title: Geo 外部模型统一渲染实施计划
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-09-11
updated: 2026-09-11
---

# Geo 外部模型统一渲染实施计划

## 目标与范围

用户只提供外部模型 URL 和定位，系统按统一标准自动呈现昼夜。只修改 Platform Geo 与其现行文档；不建设模型资产、后端或渲染 Profile。

## 前置条件

开始时暂存区和工作区为空。`pnpm docs:archive:check` 为 NOT_DUE；Foundation 为 INHERITED，无需推进 ledger。CodeGraph 无可用索引，使用文件定位。Cesium 锁定 1.144.0。

## 实施任务

- [x] 明确标准、能力接口、当前 ADR 扩展和人工验收边界。
- [x] Luna 渲染子智能体：Scene 管理器、太阳高度、Shader、资源释放与能力发布。
- [x] Luna 接入子智能体：Data 注入、模型加载/变换/移除接入、最小 UI 与能力说明。
- [x] 主智能体审查集成及失败路径，Luna 根据发现修正代码。
- [x] 静态验证、生产构建、文档门禁通过，记录人工验收项。
- [x] 完成文档、归档计划/协作记录及索引，随本次带真实模型 trailer 的功能提交交付。

## 验证与发布

执行 `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、frontend 类型/生产构建、`pnpm docs:archive:check:ci`、`git diff --check`。不运行前端自动化和浏览器测试；渲染视觉按设计交给维护者人工验收。此任务只完成本地代码提交，不部署或推送。

## 偏差、风险与关联提交

主智能体审查修正了场景事件参数、WGS84 法线、太阳计算异常清理、Scene 光色反馈累乘和暂停光源更新；第三个 Luna 只读复核 Cesium 源码及最终渲染实现。根据源码，将注册调整到 ready 后首次可见绘制前，并隔离无资源归属的场景故障。混合模型/瓦片场景不自动回退瓦片，需维护者按提示恢复。

最终 `pnpm --filter @cyber-ai-forge/frontend build` 通过（含 vue-tsc），输出 `index.html` 与 `geo.html`，保留 Sass legacy API、Rollup PURE 注释及大块体积警告。期间发现材质提示变量作用域错误，已由 Luna 修正并复跑通过。受限环境的 Vite 读取权限失败经正常权限复跑解决，无需更改依赖或构建配置。

`pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、`pnpm docs:archive:check:ci` 与 `git diff --check` 通过；归档审计 NOT_DUE。CustomShader 兼容性和 GPU 效果需人工验收，不能以类型检查替代。任务只包含本地提交，不推送或部署。关联提交为包含本计划的 `feat(geo): standardize external model day-night rendering`。

## 关联

- [设计](../../design/modules/geo-model-rendering.md)
- [ADR](../../decisions/ADR-20260911-geo-external-model-rendering.md)
- [协作记录](../ai-logs/feat/2026/09/2026-09-11-geo-external-model-rendering.md)
