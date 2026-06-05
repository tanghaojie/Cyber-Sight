# AI Web Scaffold

前后端分离的 pnpm monorepo 脚手架，以 OpenAPI 3.0 为契约层。

## 快速开始

```bash
pnpm install
cp apps/backend/.env.example apps/backend/.env
# 编辑 apps/backend/.env 填写数据库连接
pnpm dev
```

访问：
- 前端：http://localhost:5173
- 后端 API：http://localhost:3000
- Swagger UI：http://localhost:3000/docs

## 添加新接口的步骤（AI 的工作路径）

1. 修改 `packages/openapi-spec/openapi.yaml`
2. `pnpm run gen:client` — 更新前端类型
3. 在 `apps/backend/src/modules/<module>/` 实现路由
4. 在 `apps/frontend/src/modules/<module>/composables/` 封装调用

## 切换数据库

修改 `apps/backend/src/db/index.ts` 的 import：

```typescript
// PostgreSQL（默认）
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

// MySQL
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
```

## 切换后端到 Java

前端无需改动，只需用同一份 `packages/openapi-spec/openapi.yaml` 生成 Spring Boot 项目骨架，并重新运行 `pnpm run gen:client`。
