---
title: Geo Google 混合默认底图
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-31
status: completed
---

# Geo Google 混合默认底图

## 用户目标和约束

用户要求项目启动时默认不加载 Natural Earth II、天地图，只加载 Google · 混合底图。

## 关键问答与确认

将“默认不加载”解释为只改变启动图层集合，不删除数据目录中的 Natural Earth II 和天地图，使使用者仍可主动添加它们。

## AI 的重要假设

Google · 混合底图失败时不自动添加其他源；其已有可恢复瓦片降级状态继续作为唯一的故障反馈机制。

## 方案和执行摘要

在 Data 插件的安装阶段移除 Natural Earth II 与条件天地图添加，仅保留 Google · 混合底图的创建。同步替换当前 Geo 设计与影像默认 ADR，并按 `DUE` 结果进行 Platform 文档归档审查。

## 验证结果

`pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check` 和授权环境中的 `pnpm --filter @cyber-ai-forge/frontend build` 通过。受限环境的第一次构建因 Windows/esbuild 目录访问受限失败，使用相同命令的授权复跑通过；保留既有 Sass legacy API 和 Rollup 注释警告。前端自动化不在仓库授权范围。

## 未决问题与下一步

维护者仍需在有无天地图令牌的横向桌面视口中人工确认默认图层、手动添加和 Google 网络失败状态。

## 相关设计、ADR、计划和提交

- [Geo 当前设计](../../../../design/modules/geo.md)
- [Google 混合默认底图 ADR](../../../../decisions/ADR-20260831-geo-google-hybrid-default.md)
- [实施计划](../../../../plans/2026-08-31-geo-google-hybrid-default.md)
