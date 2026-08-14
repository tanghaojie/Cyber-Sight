---
title: Geo 模块设计协作记录
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-14
status: active
---

# Geo 模块设计协作记录

## 用户目标和约束

- Cyber-Sight 后续业务顺序为 Geo、Market、Intelligence，当前正式开始 Geo；
- Geo 来源于维护者的开源 Cesium 项目经验，但需要重构为更插件化的架构、现代化 UI，并具备 AI
  基础设施接入能力；
- 本轮只明确设计和实施计划，不编写 Geo 业务代码；
- 必须遵守 Platform 所有权、模块边界、共享 Zod 契约、独立 migration、前端人工验收和文档门禁；
- 任务开始时暂存区和工作区均为空，文档归档审计结果为 `NOT_DUE`。

## 关键问答与确认

- 用户接受先 Geo、后 Market 的实施顺序；
- Geo 被定位为 Cyber-Sight 首个复杂 Platform 纵向样板，而不是简单把旧仓库嵌入管理后台；
- Intelligence 暂不实施；Geo 中只设计最小受控 AI 命令能力；
- 旧项目的功能和算法可以作为需求证据，但旧架构、全局状态和示例数据不自动成为当前实现事实。

## AI 的重要假设

- 首版以个人或小团队的场景所有权为中心，不实现实时协作、多租户和分享审批；
- 首版空间数据量允许把经过限制的 GeoJSON 保存为 PostgreSQL JSONB，不需要服务器端空间查询；
- 外部影像、地形和 3D Tiles 由客户端直连数据服务，首版不增加服务端通用代理；
- AI 能力必须在核心 Geo 可独立工作后加入，模型不可直接执行任意代码或 Cesium API；
- 具体 Cesium、数据提供器和模型提供器版本在实施阶段按兼容性和许可确认，不在设计阶段虚构。

## 方案和执行摘要

- 阅读 Platform 文档入口、现行设计和 ADR，确认本任务主要作用域为 `platform`；
- 阅读模块边界、Foundation/Platform 所有权、数据库迁移和授权设计；
- 检查现有前端、后端、契约和 Platform Schema 组合入口；
- 检查授权实现后确认权限键与数据资源目录仍硬编码在 Foundation，Platform 没有贡献入口；
- 选择单一 `geo` 模块、编译期内置插件、非响应式 Viewer 适配器和统一类型化命令目录；
- 选择场景、图层、绘制要素三张 Platform 业务表，首版不引入 PostGIS；
- 定义角色功能权限、所有者数据隔离、AI 命令确认和外部数据安全边界；
- 创建 Geo 设计、长期架构 ADR 和分阶段活动计划，并更新现行索引。

## 验证结果

- `git diff --cached --quiet`：通过，开始修改前无暂存内容；
- `git status --short`：开始修改前为空；
- `pnpm docs:archive:check`：`NOT_DUE`，无归档审查计划需要创建或继续；
- `pnpm format`：通过，新建设计、ADR、计划和 AI 日志已按根 Prettier 配置格式化；
- `pnpm format:check`：通过；
- `pnpm architecture:check`：通过，所有权结构未被文档变更破坏；
- `pnpm docs:archive:check:ci`：通过，结果仍为 `NOT_DUE`；
- 新增设计、ADR、计划和 AI 日志的索引目标存在；`git diff --cached --check` 通过，提交 trailer 验证待执行。

## 未决问题与下一步

- 先在 Cyber AI Forge 为 Platform 权限和数据资源贡献设计通用 Foundation 扩展点；
- 确认首版 Cesium 版本、公开数据服务许可和开发环境令牌；
- Foundation 扩展同步完成后，按活动计划阶段 1 开始 Geo 契约、Schema 和模块骨架；
- Geo 核心人工验收通过后再选择模型提供器，不提前抽取跨业务 AI Foundation。

## 相关设计、ADR、计划和提交

- [Geo 空间可视化模块](../../../design/modules/geo.md)
- [Geo 编译期插件与统一命令架构](../../../decisions/ADR-20260814-geo-compile-time-plugins-and-commands.md)
- [Geo 空间可视化模块 MVP 实施计划](../../../plans/active/2026-08-14-geo-platform-mvp.md)
- 关联提交：待本轮验证和提交后补充。
