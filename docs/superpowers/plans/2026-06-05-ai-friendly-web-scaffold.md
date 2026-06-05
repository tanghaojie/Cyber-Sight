# AI-Friendly Web 基础框架 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建一套前后端分离的 pnpm monorepo 脚手架，以 OpenAPI 3.0 为契约层，Fastify+TypeScript 后端，Vue 3 前端，支持未来切换 Java 后端。

**Architecture:** pnpm workspace 管理三个包：`apps/backend`（Fastify）、`apps/frontend`（Vue 3）、`packages/openapi-spec`（OpenAPI yaml）。后端用 Drizzle ORM 支持 PostgreSQL/MySQL，前端通过 openapi-typescript 生成类型化 client，所有接口变更从 openapi.yaml 开始。

**Tech Stack:** pnpm, Fastify, Zod, Drizzle ORM, @fastify/swagger, Vue 3, Vite, Pinia, openapi-typescript, openapi-fetch, TypeScript, Vitest

---

## 文件结构总览

```
project-root/
├── package.json                          # workspace 根，定义全局 scripts
├── pnpm-workspace.yaml                   # 声明 apps/* packages/*
├── tsconfig.base.json                    # 共享 TS 配置
├── packages/
│   └── openapi-spec/
│       ├── package.json
│       └── openapi.yaml                  # OpenAPI 3.0 契约（唯一真相）
├── apps/
│   ├── backend/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── drizzle.config.ts             # drizzle-kit 配置
│   │   └── src/
│   │       ├── app.ts                    # 应用入口，注册插件和模块
│   │       ├── plugins/
│   │       │   ├── db.ts                 # Drizzle client（切换 pg/mysql 在这里）
│   │       │   ├── swagger.ts            # @fastify/swagger 配置
│   │       │   └── sensible.ts           # @fastify/sensible（标准错误处理）
│   │       ├── db/
│   │       │   ├── schema.ts             # Drizzle schema（数据模型唯一来源）
│   │       │   └── index.ts              # 导出 db client
│   │       └── modules/
│   │           └── health/
│   │               └── health.route.ts   # 示例：健康检查接口
│   └── frontend/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── index.html
│       └── src/
│           ├── main.ts
│           ├── App.vue
│           ├── api/
│           │   └── client.ts             # openapi-fetch 实例
│           ├── api-types/
│           │   └── schema.d.ts           # openapi-typescript 生成（不手写）
│           ├── modules/
│           │   └── health/
│           │       └── composables/
│           │           └── useHealth.ts  # 示例：封装 API 调用
│           ├── stores/                   # Pinia stores
│           ├── router/
│           │   └── index.ts              # Vue Router
│           └── views/
│               └── HomeView.vue
```

---

## Task 1: 初始化 pnpm monorepo 根配置

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`

- [ ] **Step 1: 创建根 package.json**

```json
{
  "name": "ai-web-scaffold",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "pnpm --parallel -r dev",
    "build": "pnpm --parallel -r build",
    "gen:client": "openapi-typescript packages/openapi-spec/openapi.yaml -o apps/frontend/src/api-types/schema.d.ts"
  }
}
```

- [ ] **Step 2: 创建 pnpm-workspace.yaml**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

- [ ] **Step 3: 创建共享 tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true
  }
}
```

- [ ] **Step 4: 初始化 pnpm**

```bash
pnpm install
```

Expected: `node_modules/.pnpm` 目录创建，无报错

- [ ] **Step 5: Commit**

```bash
git init
git add package.json pnpm-workspace.yaml tsconfig.base.json
git commit -m "chore: init pnpm monorepo root"
```

---

## Task 2: 创建 openapi-spec 包

**Files:**
- Create: `packages/openapi-spec/package.json`
- Create: `packages/openapi-spec/openapi.yaml`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "@scaffold/openapi-spec",
  "version": "0.1.0",
  "private": true
}
```

- [ ] **Step 2: 创建初始 openapi.yaml（含健康检查接口作为示例）**

```yaml
openapi: 3.0.3
info:
  title: AI Web Scaffold API
  version: 0.1.0
  description: AI-friendly web scaffold — spec-first, type-safe

servers:
  - url: http://localhost:3000
    description: Local development

paths:
  /health:
    get:
      operationId: getHealth
      summary: Health check
      tags:
        - Health
      responses:
        '200':
          description: Service is healthy
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/HealthResponse'

components:
  schemas:
    HealthResponse:
      type: object
      required:
        - status
        - timestamp
      properties:
        status:
          type: string
          enum: [ok]
        timestamp:
          type: string
          format: date-time
```

- [ ] **Step 3: Commit**

```bash
git add packages/
git commit -m "feat: add openapi-spec package with health endpoint"
```

---

## Task 3: 初始化后端（Fastify + TypeScript）

**Files:**
- Create: `apps/backend/package.json`
- Create: `apps/backend/tsconfig.json`
- Create: `apps/backend/src/app.ts`

- [ ] **Step 1: 创建 apps/backend/package.json**

```json
{
  "name": "@scaffold/backend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js"
  },
  "dependencies": {
    "fastify": "^4.28.0",
    "@fastify/sensible": "^5.6.0"
  },
  "devDependencies": {
    "tsx": "^4.19.0",
    "typescript": "^5.5.0",
    "@types/node": "^22.0.0"
  }
}
```

- [ ] **Step 2: 创建 apps/backend/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: 创建 src/app.ts（最小可运行入口）**

```typescript
import Fastify from 'fastify'
import sensible from '@fastify/sensible'

const app = Fastify({ logger: true })

app.register(sensible)

app.get('/ping', async () => ({ pong: true }))

const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
```

- [ ] **Step 4: 安装依赖并验证启动**

```bash
cd apps/backend && pnpm install
pnpm dev
```

Expected: `Server listening at http://0.0.0.0:3000`，访问 `http://localhost:3000/ping` 返回 `{"pong":true}`

- [ ] **Step 5: Commit**

```bash
git add apps/backend/
git commit -m "feat: init backend with Fastify"
```

---

## Task 4: 配置 Swagger（自动生成 OpenAPI spec）

**Files:**
- Create: `apps/backend/src/plugins/swagger.ts`
- Modify: `apps/backend/src/app.ts`
- Modify: `apps/backend/package.json`（添加 swagger 依赖）

- [ ] **Step 1: 添加 swagger 依赖到 apps/backend/package.json**

在 `dependencies` 中添加：

```json
"@fastify/swagger": "^8.15.0",
"@fastify/swagger-ui": "^4.0.0"
```

运行：

```bash
cd apps/backend && pnpm install
```

- [ ] **Step 2: 创建 src/plugins/swagger.ts**

```typescript
import type { FastifyInstance } from 'fastify'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

export async function registerSwagger(app: FastifyInstance) {
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'AI Web Scaffold API',
        version: '0.1.0',
        description: 'AI-friendly web scaffold — spec-first, type-safe',
      },
      servers: [{ url: 'http://localhost:3000' }],
    },
  })

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { deepLinking: true },
  })
}
```

- [ ] **Step 3: 在 src/app.ts 中注册 swagger 插件**

将 `src/app.ts` 替换为：

```typescript
import Fastify from 'fastify'
import sensible from '@fastify/sensible'
import { registerSwagger } from './plugins/swagger.js'

const app = Fastify({ logger: true })

app.register(sensible)
await registerSwagger(app)

app.get('/ping', async () => ({ pong: true }))

const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
```

- [ ] **Step 4: 验证 Swagger UI**

```bash
pnpm dev
```

访问 `http://localhost:3000/docs`，确认 Swagger UI 正常显示

- [ ] **Step 5: Commit**

```bash
git add apps/backend/
git commit -m "feat: add swagger plugin for auto OpenAPI spec generation"
```

---

## Task 5: 配置 Drizzle ORM 和数据库插件

**Files:**
- Create: `apps/backend/src/plugins/db.ts`
- Create: `apps/backend/src/db/schema.ts`
- Create: `apps/backend/src/db/index.ts`
- Create: `apps/backend/drizzle.config.ts`
- Modify: `apps/backend/package.json`

- [ ] **Step 1: 添加 Drizzle 依赖**

在 `apps/backend/package.json` 的 `dependencies` 中添加：

```json
"drizzle-orm": "^0.32.0",
"postgres": "^3.4.0"
```

在 `devDependencies` 中添加：

```json
"drizzle-kit": "^0.23.0"
```

运行：

```bash
cd apps/backend && pnpm install
```

- [ ] **Step 2: 创建 src/db/schema.ts（示例 users 表）**

```typescript
import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
```

- [ ] **Step 3: 创建 src/db/index.ts**

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema.js'

// 切换数据库：将 drizzle-orm/postgres-js 换成 drizzle-orm/mysql2
const connectionString = process.env.DATABASE_URL ?? 'postgres://localhost:5432/scaffold'
const client = postgres(connectionString)

export const db = drizzle(client, { schema })
export type Database = typeof db
```

- [ ] **Step 4: 创建 src/plugins/db.ts（将 db 挂载为 Fastify 装饰器）**

```typescript
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { db } from '../db/index.js'

declare module 'fastify' {
  interface FastifyInstance {
    db: typeof db
  }
}

export default fp(async (app: FastifyInstance) => {
  app.decorate('db', db)
})
```

在 `package.json` dependencies 中添加 `"fastify-plugin": "^4.5.1"` 并重新安装。

- [ ] **Step 5: 创建 drizzle.config.ts**

```typescript
import type { Config } from 'drizzle-kit'

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://localhost:5432/scaffold',
  },
} satisfies Config
```

- [ ] **Step 6: 在 app.ts 注册 db 插件**

在 `registerSwagger(app)` 后添加：

```typescript
import dbPlugin from './plugins/db.js'
// ...
app.register(dbPlugin)
```

- [ ] **Step 7: Commit**

```bash
git add apps/backend/
git commit -m "feat: add Drizzle ORM plugin with postgres adapter"
```

---

## Task 6: 实现 health 模块（后端示例接口）

**Files:**
- Create: `apps/backend/src/modules/health/health.route.ts`
- Modify: `apps/backend/src/app.ts`

- [ ] **Step 1: 创建 src/modules/health/health.route.ts**

```typescript
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

const healthResponseSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string().datetime(),
})

export async function healthRoutes(app: FastifyInstance) {
  app.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        summary: 'Health check',
        response: {
          200: {
            type: 'object',
            required: ['status', 'timestamp'],
            properties: {
              status: { type: 'string', enum: ['ok'] },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    async () => {
      return healthResponseSchema.parse({
        status: 'ok',
        timestamp: new Date().toISOString(),
      })
    }
  )
}
```

在 `apps/backend/package.json` dependencies 中添加 `"zod": "^3.23.0"` 并重新安装。

- [ ] **Step 2: 在 app.ts 注册 health 路由**

```typescript
import { healthRoutes } from './modules/health/health.route.js'
// ...
app.register(healthRoutes)
```

- [ ] **Step 3: 验证接口和 Swagger**

```bash
pnpm dev
```

访问 `http://localhost:3000/health`，应返回：

```json
{ "status": "ok", "timestamp": "2026-06-05T00:00:00.000Z" }
```

访问 `http://localhost:3000/docs`，确认 `/health` 接口出现在 Swagger UI 中

- [ ] **Step 4: Commit**

```bash
git add apps/backend/src/modules/
git commit -m "feat: add health route with Zod schema"
```

---

## Task 7: 初始化前端（Vue 3 + Vite）

**Files:**
- Create: `apps/frontend/package.json`
- Create: `apps/frontend/tsconfig.json`
- Create: `apps/frontend/vite.config.ts`
- Create: `apps/frontend/index.html`
- Create: `apps/frontend/src/main.ts`
- Create: `apps/frontend/src/App.vue`

- [ ] **Step 1: 创建 apps/frontend/package.json**

```json
{
  "name": "@scaffold/frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.3.0",
    "pinia": "^2.2.0",
    "openapi-fetch": "^0.11.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.1.0",
    "vite": "^5.4.0",
    "vue-tsc": "^2.1.0",
    "typescript": "^5.5.0",
    "openapi-typescript": "^7.3.0"
  }
}
```

- [ ] **Step 2: 创建 apps/frontend/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "preserve",
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  },
  "include": ["src"]
}
```

- [ ] **Step 3: 创建 apps/frontend/vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

- [ ] **Step 4: 创建 index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Web Scaffold</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 5: 创建 src/main.ts**

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.js'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
```

- [ ] **Step 6: 创建 src/App.vue**

```vue
<template>
  <RouterView />
</template>
```

- [ ] **Step 7: 安装依赖并验证启动**

```bash
cd apps/frontend && pnpm install
pnpm dev
```

Expected: Vite 启动，访问 `http://localhost:5173` 无报错

- [ ] **Step 8: Commit**

```bash
git add apps/frontend/
git commit -m "feat: init frontend with Vue 3, Vite, Pinia, Vue Router"
```

---

## Task 8: 配置路由和示例首页

**Files:**
- Create: `apps/frontend/src/router/index.ts`
- Create: `apps/frontend/src/views/HomeView.vue`

- [ ] **Step 1: 创建 src/router/index.ts**

```typescript
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
  ],
})

export default router
```

- [ ] **Step 2: 创建 src/views/HomeView.vue（占位首页）**

```vue
<template>
  <main>
    <h1>AI Web Scaffold</h1>
    <p>Backend status: {{ status }}</p>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const status = ref('loading...')
</script>
```

- [ ] **Step 3: Commit**

```bash
git add apps/frontend/src/router/ apps/frontend/src/views/
git commit -m "feat: add Vue Router with home view"
```

---

## Task 9: 生成前端 API Client（openapi-typescript）

**Files:**
- Create: `apps/frontend/src/api-types/schema.d.ts`（生成）
- Create: `apps/frontend/src/api/client.ts`

- [ ] **Step 1: 在根 package.json 添加 gen:client script（已在 Task 1 完成，验证即可）**

确认根 `package.json` 中有：

```json
"gen:client": "openapi-typescript packages/openapi-spec/openapi.yaml -o apps/frontend/src/api-types/schema.d.ts"
```

- [ ] **Step 2: 安装根级 openapi-typescript**

```bash
pnpm add -Dw openapi-typescript
```

- [ ] **Step 3: 运行生成命令**

```bash
pnpm run gen:client
```

Expected: `apps/frontend/src/api-types/schema.d.ts` 文件生成，内含 `getHealth` 等类型定义

- [ ] **Step 4: 创建 src/api/client.ts**

```typescript
import createClient from 'openapi-fetch'
import type { paths } from '../api-types/schema.js'

export const apiClient = createClient<paths>({
  baseUrl: '/api',
})
```

- [ ] **Step 5: 验证类型生成**

在 `src/api/client.ts` 同目录下尝试：

```typescript
// 验证：apiClient.GET('/health') 应有完整类型推断
// 在编辑器里输入 apiClient.GET('/  应能看到 /health 自动补全
```

- [ ] **Step 6: Commit**

```bash
git add apps/frontend/src/api-types/ apps/frontend/src/api/
git commit -m "feat: generate typed API client from OpenAPI spec"
```

---

## Task 10: 实现 health composable 并连接首页

**Files:**
- Create: `apps/frontend/src/modules/health/composables/useHealth.ts`
- Modify: `apps/frontend/src/views/HomeView.vue`

- [ ] **Step 1: 创建 src/modules/health/composables/useHealth.ts**

```typescript
import { ref, onMounted } from 'vue'
import { apiClient } from '../../../api/client.js'

export function useHealth() {
  const status = ref<string>('loading...')
  const timestamp = ref<string>('')
  const error = ref<string | null>(null)

  const fetchHealth = async () => {
    const { data, error: err } = await apiClient.GET('/health')
    if (err) {
      error.value = 'Failed to reach backend'
      status.value = 'error'
      return
    }
    status.value = data.status
    timestamp.value = data.timestamp
  }

  onMounted(fetchHealth)

  return { status, timestamp, error, fetchHealth }
}
```

- [ ] **Step 2: 更新 src/views/HomeView.vue 使用 composable**

```vue
<template>
  <main>
    <h1>AI Web Scaffold</h1>
    <p>Backend status: <strong>{{ status }}</strong></p>
    <p v-if="timestamp">Last checked: {{ timestamp }}</p>
    <p v-if="error" style="color: red">{{ error }}</p>
    <button @click="fetchHealth">Refresh</button>
  </main>
</template>

<script setup lang="ts">
import { useHealth } from '../modules/health/composables/useHealth.js'

const { status, timestamp, error, fetchHealth } = useHealth()
</script>
```

- [ ] **Step 3: 验证端到端流程**

同时启动前后端：

```bash
pnpm dev
```

访问 `http://localhost:5173`，页面应显示 `Backend status: ok`

- [ ] **Step 4: Commit**

```bash
git add apps/frontend/src/modules/ apps/frontend/src/views/
git commit -m "feat: add health composable and connect to home view"
```

---

## Task 11: 添加 .env 配置和 .gitignore

**Files:**
- Create: `.env.example`
- Create: `.gitignore`
- Create: `apps/backend/.env.example`

- [ ] **Step 1: 创建根 .gitignore**

```gitignore
node_modules/
dist/
.env
*.local
.DS_Store
drizzle/
```

- [ ] **Step 2: 创建 apps/backend/.env.example**

```bash
DATABASE_URL=postgres://user:password@localhost:5432/scaffold
PORT=3000
```

- [ ] **Step 3: 创建根 .env.example**

```bash
# 复制为 .env 并填写实际值
# 后端环境变量
DATABASE_URL=postgres://user:password@localhost:5432/scaffold
```

- [ ] **Step 4: Commit**

```bash
git add .gitignore .env.example apps/backend/.env.example
git commit -m "chore: add gitignore and env examples"
```

---

## Task 12: 编写 README（开发入门指南）

**Files:**
- Create: `README.md`

- [ ] **Step 1: 创建 README.md**

```markdown
# AI Web Scaffold

前后端分离的 pnpm monorepo 脚手架，以 OpenAPI 3.0 为契约层。

## 快速开始

\```bash
pnpm install
cp apps/backend/.env.example apps/backend/.env
# 编辑 apps/backend/.env 填写数据库连接
pnpm dev
\```

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

\```typescript
// PostgreSQL（默认）
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

// MySQL
import { drizzle } from 'drizzle-orm/mysql2'
import mysql from 'mysql2/promise'
\```

## 切换后端到 Java

前端无需改动，只需用同一份 `packages/openapi-spec/openapi.yaml` 生成 Spring Boot 项目骨架，并重新运行 `pnpm run gen:client`。
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with quickstart and workflow guide"
```

---

## 验证清单

- [ ] `pnpm install` 在根目录正常运行
- [ ] `pnpm dev` 同时启动前后端
- [ ] 访问 `http://localhost:3000/health` 返回 `{"status":"ok","timestamp":"..."}`
- [ ] 访问 `http://localhost:3000/docs` 显示 Swagger UI，`/health` 接口可见
- [ ] 修改 `packages/openapi-spec/openapi.yaml` 后运行 `pnpm run gen:client`，`schema.d.ts` 更新
- [ ] 访问 `http://localhost:5173`，页面显示 `Backend status: ok`
- [ ] 修改 `apps/backend/src/db/index.ts` 的 adapter import，TypeScript 编译无报错
