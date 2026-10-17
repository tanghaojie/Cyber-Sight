---
title: Geo 外部数据菜单拆分
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-10-17
updated: 2026-10-17
---

# Geo 外部数据菜单拆分

## 目标与范围

按维护者要求将外部数据独立为菜单，仅保留 GeoJSON URL、模型 URL、3D Tiles URL，移除地标与周边入口。实现限定在 Platform Geo 前端及相关现行设计、计划和协作记录。

## 背景与设计依据

见 [独立菜单设计](../../design/modules/geo-external-data.md)。开始时暂存区和工作区为空，归档检查为 NOT_DUE，无同事项活动计划。不引入新的长期技术架构决策。

## 实施任务

- [x] 拆分外部数据面板，保留三种 URL 和资源管理。
- [x] 登记独立菜单、面板和中英文任务文案。
- [x] 同步现行设计与索引。
- [x] 完成静态验证，归档记录并自动提交。

## 测试与验证

格式化与格式检查、修改文件 ESLint、前端 TypeScript/生产构建、架构检查、文档归档 CI。前端交互由维护者人工验收，不运行浏览器测试。

## 发布与回滚

本地提交供维护者验收；没有发布或推送要求。需要回滚时回退本次菜单与面板提交，资源 controller 和加载协议不变。

## 实际偏差和遗留问题

已拆分两个菜单与面板，三种 URL 默认值和资源管理保留；地标与周边 UI 移除。TypeScript/生产构建、修改文件 ESLint、模块所有权、pnpm format、pnpm format:check、归档 CI（NOT_DUE）、diff 与新增文档链接核对均通过。无实现偏差；视觉及交互待维护者人工验收，未运行前端自动化。

## 关联

- [Geo 模块设计](../../design/modules/geo.md)
- [协作记录](../ai-logs/feat/2026/10/2026-10-17-geo-external-data-menu.md)
