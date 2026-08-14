---
title: 分层运行时配置
scope: foundation
repository: Cyber-AI-Forge
status: active
owner: project maintainers
updated: 2026-08-13
---

# 分层运行时配置

## 背景与目标

Forge 提供 Foundation 共享脚手架，业务平台在 Platform 作用域中维护自己的运行时配置。两者必须分别维护，且应用仍需在启动或构建时得到一个完整、已校验的配置对象。本设计统一后端 Node 配置和前端 Vite 配置的分层规则，不把双方实现合并为一个同步热点。

## 范围与非目标

Foundation 拥有基础运行时配置的定义和校验：后端数据库连接、JWT 密钥、监听地址与端口；前端本地开发端口。Platform 拥有业务 API 元数据、JWT identity 和前端品牌配置。Integration 只负责加载文件、合并优先级和装配，不拥有业务配置字段。

本设计不把后端密钥注入前端，不新增共享配置 package，不改变 API 契约、数据库 Schema、迁移历史或环境变量语义。

## 所有权与目录

```text
apps/backend/
├── env/
│   ├── .env.foundation.example
│   └── .env.platform.example
└── src/
    ├── foundation/config/foundation.config.ts
    ├── platform/config/platform.config.ts
    └── config/
        ├── environment.ts
        └── runtime.config.ts

apps/frontend/
├── env/
│   ├── .env.foundation.example
│   └── .env.platform.example
└── src/
    ├── foundation/config/foundation.config.ts
    ├── platform/config/platform.config.ts
    └── config/runtime.config.ts
```

Foundation 文件由 Forge 维护并同步；Platform 文件由业务平台维护；Integration 文件属于集成控制面，变更需要同步报告和验证。所有环境文件集中放在对应 workspace 的 `env/` 目录中；`.env`、`.env.local`、`.env.foundation.local` 和 `.env.platform.local` 被 Git 忽略，不进入提交或合并。

## 配置字段边界

| 作用域     | 后端字段                                                                    | 前端字段                            |
| ---------- | --------------------------------------------------------------------------- | ----------------------------------- |
| Foundation | `DATABASE_URL`、`JWT_SECRET`、`PORT`、`HOST`                                | `VITE_PORT`、`VITE_BACKEND_PORT`    |
| Platform   | `API_TITLE`、`API_VERSION`、`API_DESCRIPTION`、`JWT_AUDIENCE`、`JWT_ISSUER` | `VITE_APP_*`、`VITE_STORAGE_PREFIX` |

Foundation 负责其字段的格式校验；Platform 负责其字段的默认值和格式校验。Platform 可以在本地文件或部署环境中提供 Foundation 字段的值，但不能改变 Foundation 的校验责任。

## 加载顺序与数据流

后端 Integration 入口从 `apps/backend/env/` 按以下顺序读取文件，并让后者覆盖前者：

```text
.env -> .env.local -> .env.foundation.local -> .env.platform.local -> process.env
```

`process.env` 拥有最高优先级，便于容器和生产部署覆盖本地文件。聚合结果分别交给 `parseFoundationEnvironment` 和 `parsePlatformEnvironment`，得到 `runtimeConfig.foundation` 与 `runtimeConfig.platform`。应用入口、数据库连接和 Drizzle 配置只消费已校验结果。

前端 Vite 将 `env/` 作为 `envDir`，在保留模式文件加载顺序的基础上追加 Foundation/Platform local 文件，并将进程环境放在最高优先级。只有以 `VITE_` 开头的变量通过构建注入浏览器；前端 `runtimeConfig` 同时聚合 Foundation 开发端口和 Platform 品牌配置。Platform 通过 `PlatformDefinition` 向 Foundation 页面提供品牌配置，Foundation 不导入 Platform 内部文件。

## 失败模式与安全考虑

- `DATABASE_URL`、`JWT_SECRET`、端口和地址等 Foundation 配置非法时，后端在启动阶段失败，错误不回显配置值。
- Platform 可选字符串为空或纯空白时使用默认值；JWT identity 改变会使旧令牌失效。
- 前端只暴露 `VITE_*`，禁止在前端 local 文件中放置后端密钥。
- Integration 文件路径属于合并控制面，未知路径或跨作用域冲突必须人工审查。

## 测试与验证策略

- 后端测试分别覆盖 Foundation/Platform 解析器、分层覆盖顺序、必填项和默认值。
- `pnpm architecture:check` 检查 Foundation 不反向依赖 Platform。
- 前端执行 TypeScript 检查和生产构建；浏览器覆盖由维护者人工验收。
- 同步验证检查 `.forge-sync.yml` 中的 Foundation、Platform 和 Integration 分类。

## 兼容性与迁移

本次保留现有环境变量名称，仅把示例文件拆为 `env/.env.foundation.example` 与 `env/.env.platform.example`。本地开发者应在对应 workspace 的 `env/` 中分别复制为 `.env.foundation.local` 和 `.env.platform.local`；部署环境无需文件迁移，可继续直接提供进程环境变量。旧的单一 `.env.example` 不再作为版本控制入口。

## 相关 ADR、计划和 AI 日志

- [ADR-20260813：分层运行时配置与聚合入口](../decisions/ADR-20260813-layered-runtime-configuration.md)
- [Foundation 与 Platform 所有权边界](foundation-platform-ownership.md)
- [Platform 运行时配置](../../platform/design/runtime-configuration.md)
- [实施计划](../archive/plans/2026-08-13-layered-runtime-configuration.md)
