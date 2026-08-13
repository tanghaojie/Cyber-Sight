---
title: Foundation 与 Platform 分层运行时配置
scope: foundation
repository: Cyber-AI-Forge
owner: maintainers
status: completed
created: 2026-08-13
updated: 2026-08-13
type: documentation-archive-review
---

# Foundation 与 Platform 分层运行时配置

## 目标

建立 Foundation、Platform 和 Integration 三层运行时配置边界，使 Forge 基础脚手架配置与业务平台配置可以分别维护、分别同步，并在应用启动或构建时聚合为统一配置对象。

## 背景与设计依据

当前后端 `env.ts` 在 Foundation 目录中同时解析数据库、JWT、API 元数据和平台身份配置；前端 `app.config.ts` 在 Platform 目录中直接读取品牌变量，Vite 配置又单独读取端口变量。需要统一加载顺序和所有权，同时保持 Foundation 不依赖 Platform。

## 范围

- 后端 Foundation/Platform 配置解析、Integration 聚合和 Drizzle 配置加载。
- 前端 Foundation/Platform 配置解析、Vite 端口配置聚合和应用入口消费。
- 分层 `.env.*.example` 文件、同步清单、设计文档、测试和操作说明。
- 受影响作用域：`platform`；主要维护作用域：`foundation`。

## 非目标

- 不把后端密钥注入前端构建产物。
- 不新增共享配置 package。
- 不修改 HTTP 契约、数据库 Schema、迁移历史或业务配置名称。
- 不修改本地 `.env` 文件中的真实凭据。

## 前置条件和风险

- `*.local` 文件必须继续被 Git 忽略。
- Integration 文件属于同步控制文件，Forge 与下游合并时可能需要人工审查。
- Vite 只允许 `VITE_*` 变量进入浏览器构建。
- 现有单文件 `.env.example` 需要迁移为分层示例，并同步 README 与指南。

## 实施任务

- [x] 建立后端 Foundation、Platform 和 Integration 配置模块，统一加载 `.env.foundation.local`、`.env.platform.local` 与进程环境。
- [x] 更新后端启动入口、数据库入口和 Drizzle 配置使用聚合配置。
- [x] 建立前端 Foundation、Platform 和 Integration 配置模块，统一品牌与本地开发端口读取。
- [x] 更新 Vite 和前端启动入口，保持 Platform 注入 Foundation 的单向边界。
- [x] 更新分层环境示例、同步清单、当前设计、模块设计和操作文档。
- [x] 增加后端配置解析测试并执行完整验证。
- [x] 完成归档审查，将计划和日志归档并更新索引。

## 测试与验证

- 后端配置单元测试覆盖默认值、空白值、分层优先级、必填项和未知层变量。
- 执行 `pnpm architecture:check`、`pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm test`、`pnpm build`。
- 执行 `pnpm docs:archive:check:ci`。
- 前端浏览器行为由维护者人工验收，不新增浏览器自动化测试。

## 发布与回滚

部署环境继续直接提供进程环境变量；本地开发复制两份对应 `.env.*.example` 为 `.env.*.local`。回滚时恢复旧配置入口和旧示例文件，不触及数据库。

## 实际偏差和遗留问题

实施完成后补充实际验证结果、偏差、遗留问题和关联提交。

## 相关设计、ADR 和 AI 日志

- [Foundation 与 Platform 所有权边界](../../design/foundation-platform-ownership.md)
- [Platform 运行时配置](../../../platform/design/runtime-configuration.md)
- [AI 协作记录](../ai-logs/2026/08/2026-08-13-layered-runtime-configuration.md)
