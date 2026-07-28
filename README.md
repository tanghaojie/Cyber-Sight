# JTLab

JTLab（桀士实验室）是前后端分离的 pnpm monorepo 管理系统脚手架，以共享 Zod 运行时 Schema 约束前后端接口，内置登录、数据库动态菜单、管理后台框架和用户/角色/菜单/字典管理。

前端默认主色为 `#70CFA2`。品牌配置位于 `apps/frontend/src/config/app.config.ts`，也可复制 `apps/frontend/.env.example` 后通过 `VITE_APP_NAME`、`VITE_APP_FULL_NAME`、`VITE_APP_TAGLINE` 和 `VITE_APP_PRODUCT_LABEL` 按部署环境覆盖。

## 快速开始

```bash
pnpm install
# Windows PowerShell
Copy-Item apps/backend/.env.example apps/backend/.env
# 编辑 apps/backend/.env，填写数据库连接和至少 32 个字符的 JWT_SECRET
pnpm db:migrate
pnpm dev
```

访问：

- 前端：http://localhost:5173
- 后端 API：http://localhost:3000
- Swagger UI：http://localhost:3000/docs

首次执行迁移会创建本地管理员 `admin / Admin@123456`。该凭据仅用于本地初始化，进入共享或生产环境前必须修改。

菜单路由由数据库生成：目录负责展开子节点，菜单通过受控组件标识加载站内页面，按钮打开 `http/https` 外链。新增页面时在所属模块的 `view-registry.ts` 登记懒加载器；中心注册表会在构建期自动发现它，最后在菜单管理中填写稳定组件标识。

所有业务表统一使用软删除，并包含 `is_deleted`、`created_at`、`created_by`、`updated_at`、`updated_by` 五个生命周期字段。

## 添加新接口的步骤（AI 的工作路径）

1. 在 `packages/api-contract` 定义运行时 Schema 和推导类型
2. 在 `apps/backend/src/modules/<module>/` 挂载共享 Schema 并实现路由
3. 在 `apps/frontend/src/modules/<module>/` 以共享类型封装调用
4. 补充合法/非法请求、响应结构和前端状态测试
5. 运行 `pnpm test` 和 `pnpm build`

## 常用命令

```bash
pnpm test          # 后端路由/契约测试和前端组件测试
pnpm build         # TypeScript 检查和生产构建
pnpm db:generate   # 根据 Drizzle Schema 生成迁移
pnpm db:migrate    # 应用迁移
pnpm test:db       # 检查 PostgreSQL 连接和关键表
```

当前数据库实现是 PostgreSQL。切换 MySQL 会同时影响驱动、Drizzle Schema、迁移和测试，必须作为独立架构变更处理，不能只替换 import。

## 引入 Java 后端

当前前后端通过 `@scaffold/api-contract` 使用共享契约。Java 需求正式立项时，应先从 Fastify `/docs/json` 导出并审查 OpenAPI，建立版本化跨语言契约和回归测试；项目不为尚未发生的切换长期维护第二份手写契约。

## 开发文档

- [人类维护者开发指南](docs/guides/human-maintainer-development-guide.md)：目录职责、运行时 Schema、Drizzle、Vitest、新增接口和数据库维护流程。
- [错误码参考](docs/reference/error-codes.md)：统一响应、错误码区间和登记流程。
- [系统与模块设计](docs/design/README.md)：当前有效架构和模块边界。
