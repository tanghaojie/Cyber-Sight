# AI Web Scaffold

前后端分离的 pnpm monorepo 脚手架，以 OpenAPI 3.0 为契约层。

## 快速开始

```bash
pnpm install
# Windows PowerShell
Copy-Item apps/backend/.env.example apps/backend/.env
# 编辑 apps/backend/.env 填写数据库连接
pnpm db:migrate
pnpm dev
```

访问：
- 前端：http://localhost:5173
- 后端 API：http://localhost:3000
- Swagger UI：http://localhost:3000/docs

## 添加新接口的步骤（AI 的工作路径）

1. 修改 `packages/openapi-spec/openapi.yaml`
2. `pnpm gen:api` — 更新前后端共享类型
3. 在 `apps/backend/src/modules/<module>/` 实现路由
4. 在 `apps/frontend/src/modules/<module>/composables/` 封装调用
5. 补充路由、契约和前端状态测试，然后运行 `pnpm test && pnpm build`

## 常用命令

```bash
pnpm gen:api       # 生成共享 OpenAPI 类型
pnpm test          # 后端路由/契约测试和前端组件测试
pnpm build         # TypeScript 检查和生产构建
pnpm db:generate   # 根据 Drizzle Schema 生成迁移
pnpm db:migrate    # 应用迁移
pnpm test:db       # 检查 PostgreSQL 连接和关键表
```

当前数据库实现是 PostgreSQL。切换 MySQL 会同时影响驱动、Drizzle Schema、迁移和测试，必须作为独立架构变更处理，不能只替换 import。

## 切换后端到 Java

前端通过 `@scaffold/openapi-spec` 使用共享契约类型。切换 Java 时应保持 `packages/openapi-spec/openapi.yaml` 的接口语义，并通过同一组契约回归测试验证新实现。

## 开发文档

- [人类维护者开发指南](docs/guides/human-maintainer-development-guide.md)：目录职责、OpenAPI、Drizzle、Vitest、新增接口和数据库维护流程。
- [错误码参考](docs/reference/error-codes.md)：统一响应、错误码区间和登记流程。
- [系统与模块设计](docs/design/README.md)：当前有效架构和模块边界。
