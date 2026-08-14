---
title: Platform 环境变量配置收敛
scope: platform
repository: Cyber-AI-Forge
owner: maintainers
date: 2026-08-12
status: completed
---

# Platform 环境变量配置收敛

## 用户目标和约束

用户要求把前端 `githubUrl`、`creatorName`、`creatorFullName` 加入 `.env.example` 并让 `app.config.ts` 只负责读取与失败兜底；同时判断并清理无意义的 `primaryColor`。后端采用一致的环境变量方式，并判断是否可以删除 `platform.config.ts`、由 `env.ts` 完成逻辑。

## 关键问答与确认

- 静态搜索确认 `primaryColor` 仅在配置对象和接口中声明，没有运行时消费者；主题色由 settings 模块管理。
- `platformConfig` 仅被 `app.ts` 消费，因此其 API 元数据和 JWT identity 可直接迁入统一的后端环境配置。
- 环境变量沿用现有命名分组：前端使用 `VITE_APP_*`，后端使用 `API_*` 与 `JWT_*`。

## AI 的重要假设

- 缺失、空字符串和纯空白可选配置都应回退默认值。
- `DATABASE_URL` 和 `JWT_SECRET` 的必填与启动失败策略保持不变。
- 本次不修改本地 `.env`，只更新版本控制中的示例配置。

## 方案和执行摘要

先按仓库门禁检查暂存区和归档状态，再建立 Platform 设计与实施记录。实现已移除无消费字段，把前端品牌元数据和后端展示/身份元数据统一接入环境变量，并同步现行 Foundation 与 Forge 文档。后端新增可独立测试的 `parseEnvironment()`，生产导出仍在模块加载时固定解析结果。

## 验证结果

- `pnpm format`、`pnpm lint`、`pnpm test` 和 `pnpm build` 通过。
- 后端 17 个测试文件、142 项测试全部通过，其中包含新增的 2 项环境配置测试。
- 全仓生产构建通过；仅保留既有 Sass legacy API、VueUse 注释和 `AdminLayout` chunk 警告。
- 静态搜索、`git diff --check` 和 `pnpm format:check` 通过。
- `pnpm docs:archive:check:ci` 通过，归档状态为 `NOT_DUE`。

## 未决问题与下一步

- 前端环境变量覆盖效果、Swagger 展示和主题切换仍需维护者人工验收。
- 实施没有偏离设计，也没有形成需要 ADR 固化的新决策。
- 关联提交为 `refactor: configure platform metadata via env`（本记录归档所在提交）。
