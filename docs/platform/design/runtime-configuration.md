---
title: Platform 运行时配置
scope: platform
repository: Cyber-AI-Forge
status: active
owner: maintainers
updated: 2026-08-12
---

# Platform 运行时配置

## 背景与目标

Platform 的部署相关品牌文字、项目链接、创作者署名、Swagger 元数据和 JWT identity 必须能够通过环境变量覆盖，同时保留 Cyber AI Forge 的开箱默认值。配置入口只负责读取、规范化和失败兜底，不承载主题状态或业务规则。

## 范围与非目标

本设计覆盖前端 `appConfig`、前端和后端 `.env.example`、后端经过 Zod 校验的 `env`，以及应用组装对这些配置的消费。主要作用域为 `platform`，同时影响 `foundation` 的前端注入接口和后端配置入口，并同步 Forge 品牌说明。

本次不改变 HTTP 契约、JWT 算法、令牌兼容策略、主题持久化格式或视觉资产。生产密钥仍必须由部署环境提供，不设置安全降级默认值。

## 职责与边界

- `apps/frontend/src/platform/config/app.config.ts` 读取 `VITE_APP_*` 品牌变量和 `VITE_STORAGE_PREFIX`；缺失、空字符串或纯空白时回退到仓库默认品牌。
- `apps/backend/src/foundation/config/env.ts` 在进程启动时统一加载、规范化和校验环境变量。`DATABASE_URL` 与 `JWT_SECRET` 必填；API 展示元数据和 JWT issuer/audience 可覆盖，并在缺失或空白时使用默认值。
- `apps/backend/src/app.ts` 只消费已经校验的 `env` 完成 Swagger 和认证依赖组装，不维护第二份 Platform 常量对象。
- 主题颜色不属于静态 Platform 配置。Foundation settings 模块和语义 CSS 令牌拥有运行时主题状态，因此 `PlatformConfig` 不暴露未消费的 `primaryColor`。

## 公共接口

前端 `PlatformConfig` 保留 `name`、`fullName`、`tagline`、`githubUrl`、`creatorName`、`creatorFullName` 和 `storagePrefix`。新增部署入口为：

- `VITE_APP_GITHUB_URL`
- `VITE_APP_CREATOR_NAME`
- `VITE_APP_CREATOR_FULL_NAME`

后端 `env` 新增经过规范化的字段：

- `API_TITLE`
- `API_VERSION`
- `API_DESCRIPTION`
- `JWT_AUDIENCE`
- `JWT_ISSUER`

## 数据流与依赖

构建期的 Vite 环境变量进入 `appConfig`，再通过 Platform 注册边界注入 Foundation 页面。后端进程环境由 `env.ts` 一次性解析，`app.ts` 使用 API 元数据创建 Swagger 文档，并把 JWT identity 注入认证模块。

Foundation 不反向导入 Platform 内部配置文件。Platform 只通过既有注册和应用组装边界向 Foundation 提供配置。

## 失败模式与安全考虑

- 可选字符串配置为空或只有空白时回退默认值，避免空标题、空署名或无效 JWT identity。
- `DATABASE_URL`、`JWT_SECRET` 或端口等必填/受约束配置非法时，后端仍在启动阶段失败，并且错误不回显配置值。
- 修改 JWT issuer 或 audience 会使旧令牌无法通过严格校验，部署方必须把它视为会话兼容性变更。
- 修改前端文字但不替换 Logo 时可能产生白标不一致，部署方需要同步视觉资产。

## 验证策略

- 执行根目录格式化、格式检查、Lint、后端测试和全仓生产构建。
- 静态搜索确认 `primaryColor` 与后端 `platformConfig` 不再存在运行时引用。
- 前端不创建或运行自动化浏览器测试；维护者人工检查环境变量覆盖后的标题、链接、署名、Swagger 展示和主题切换。
