---
title: Platform 环境变量配置收敛计划
scope: platform
repository: Cyber-AI-Forge
owner: maintainers
status: completed
created: 2026-08-12
updated: 2026-08-12
---

# Platform 环境变量配置收敛计划

## 目标

把剩余前端品牌字段、后端 API 元数据和 JWT identity 收敛到环境变量入口，删除无消费的静态主题色和冗余后端 Platform 配置文件。

## 背景与设计依据

依据 [Platform 运行时配置](../../design/runtime-configuration.md)。现有前端 `appConfig` 已对部分字段实现空白回退，但项目链接和创作者署名仍为常量；后端同类常量单独保存在 `platform.config.ts`。主题色已由 settings 模块管理，`primaryColor` 没有消费者。

## 范围

- 主要作用域：`platform`。
- 受影响作用域：`foundation` 的配置解析、认证注入接口和现行设计；`forge` 的品牌配置说明。
- 更新前后端 `.env.example`、配置读取、类型和应用组装。
- 删除不再需要的 `apps/backend/src/platform/config/platform.config.ts`。

## 非目标

- 不调整主题选项、JWT 算法、API 响应或数据库结构。
- 不修改本地 `.env`，也不提供生产密钥默认值。
- 不执行或新增前端自动化浏览器测试。

## 前置条件和风险

- 开始时暂存区和工作区为空。
- `pnpm docs:archive:check` 结果为 `NOT_DUE`。
- 自定义 JWT identity 会使先前签发的令牌失效，必须保持 issuer/audience 严格校验。

## 实施任务

1. 更新现行设计和协作记录。
2. 为前端项目链接和创作者署名增加环境变量读取与空白回退，移除 `primaryColor`。
3. 在后端 `env.ts` 增加 API 元数据和 JWT identity，更新应用组装并删除冗余配置文件。
4. 更新示例环境文件与相关现行文档。
5. 执行格式化、静态检查、测试、构建和文档校验。
6. 记录结果，归档计划与协作记录并提交。

## 验证计划

- `pnpm format`
- `pnpm format:check`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm docs:archive:check:ci`
- 静态搜索配置字段和已删除文件引用

## 完成条件

实现、示例配置和现行文档一致；所有允许执行的验证通过；计划和 AI 日志已归档；创建包含真实模型 trailer 的 Git 提交。

## 实际结果

- 前端项目链接和创作者署名已支持 `VITE_APP_*` 覆盖，并沿用缺失或空白回退；无消费的 `primaryColor` 已从配置对象和 Foundation 注入接口移除。
- 后端 Swagger 元数据和 JWT identity 已进入 `env.ts` 的单点解析；`app.ts` 只消费已校验配置，原 `platform.config.ts` 已删除。
- 新增后端单元测试覆盖默认回退和自定义值去空白，示例环境文件与 Foundation、Forge、Platform 现行设计已同步。

## 验证结果

- `pnpm format`：通过。
- `pnpm lint`：通过。
- `pnpm test`：通过，17 个测试文件、142 项测试全部通过。
- `pnpm build`：通过；保留既有 Sass legacy API、VueUse 注释和 `AdminLayout` chunk 警告。
- 静态搜索与 `git diff --check`：通过，运行时代码中不再存在 `primaryColor` 或后端 `platformConfig` 引用。
- `pnpm format:check`：通过。
- `pnpm docs:archive:check:ci`：通过，状态为 `NOT_DUE`。

## 偏差、遗留问题和关联提交

- 实施无设计偏差，也未新增 ADR。
- 按仓库前端验证边界未运行浏览器自动化；环境变量覆盖后的标题、链接、署名、Swagger 展示和主题切换由维护者人工验收。
- 关联提交：`refactor: configure platform metadata via env`（本计划归档所在提交）。
