---
title: Geo 外部数据菜单拆分
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-10-17
status: completed
change_type: feat
---

# Geo 外部数据菜单拆分

## 用户目标和约束

外部数据从“数据”中独立，只保留默认 GeoJSON URL、模型 URL、3D Tiles URL 三个入口，不再提供地标与周边。先交付菜单与面板设计调整。

## 重要假设和方案

按 Geo 内部任务菜单理解“独立菜单项”。GeoJSON 和 3D Tiles 原本默认空白，模型保留现有预置 URL。将加载表单和资源操作移入独立组件，同一 data 插件和 controller 继续持有状态与生命周期，不新增业务模块或删除底层地标工具。

## 执行与验证

首次修改前暂存区检查通过，工作区为空；CodeGraph 定位 data 插件、面板和任务组装；归档审计 NOT_DUE。已完成独立 external-data 任务组与面板、三种类型选择卡片、URL 表单迁移和资源管理；数据面板只保留底图与地形，移除地标入口及对应 UI 状态和样式。中英文任务名和现行 Geo/地标设计已同步。TypeScript/生产构建、修改文件 ESLint、模块边界检查与 pnpm format 通过；构建仅有 Sass legacy API、第三方 PURE 注释与大 chunk 提示。不创建或运行前端自动化测试。

## 未决问题与关联

最终 `pnpm format:check`、`pnpm docs:archive:check:ci`（NOT_DUE）、`git diff --check` 和新增文档相对链接核对通过。

浏览器功能与视觉仍需维护者人工验收。

- [设计](../../../../../design/modules/geo-external-data.md)
- [计划](../../../../plans/2026-10-17-geo-external-data-menu.md)
- 提交：`feat(geo): separate external data menu`（本记录随同提交，由 Git 历史追溯）。
