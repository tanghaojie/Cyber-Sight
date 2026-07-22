# 人类维护者开发指南

## 1. 这份指南适合谁

本项目虽然以 AI 辅助开发为主，但所有实现必须能够由全栈工程师阅读、调试和修改。本指南面向熟悉 TypeScript、Vue、Node.js 和关系型数据库，但不熟悉 OpenAPI、Drizzle ORM 或 Vitest 工作模式的维护者。

阅读完后，你应该能够：

- 判断一个改动应该落在哪个包或模块。
- 新增或修改一个前后端接口。
- 理解并维护统一响应、分页和错误码。
- 修改数据库 Schema、生成和执行迁移。
- 编写后端路由测试、契约测试和前端组件测试。
- 按项目文档和 Git 规则完成一次可回溯交付。

## 2. 项目的整体思路

项目是 pnpm workspace，包含一个共享契约包和两个应用：

```text
packages/openapi-spec/openapi.yaml
        |                         API 的跨语言契约
        v
packages/openapi-spec/src/schema.d.ts
        |                         自动生成的 TypeScript 类型
        +------------------+
        |                  |
        v                  v
apps/frontend          apps/backend
Vue 3 + openapi-fetch  Fastify + Drizzle
```

最重要的原则是“契约优先”：接口变化先改 OpenAPI，再生成共享类型，最后修改后端实现和前端调用。不要先改后端，然后靠人脑把变化同步到前端。

## 3. 开发环境与首次启动

### 3.1 前置软件

- Node.js：当前开发环境使用 Node.js 24。
- pnpm：当前使用 pnpm 11。
- PostgreSQL：本地或容器均可，连接字符串使用标准 PostgreSQL URL。

### 3.2 初始化

```powershell
pnpm install
Copy-Item apps/backend/.env.example apps/backend/.env
# 编辑 apps/backend/.env，填写本地 DATABASE_URL
pnpm db:migrate
pnpm dev
```

默认地址：

- 前端：`http://localhost:5173`
- 后端：`http://localhost:3000`
- Swagger UI：`http://localhost:3000/docs`
- Swagger JSON：`http://localhost:3000/docs/json`

本地 `.env` 被 Git 忽略，禁止把真实密码复制到 README、设计文档、测试或提交记录中。

## 4. 目录和模块职责

### 4.1 仓库根目录

| 文件或目录 | 作用 | 修改时机 |
| --- | --- | --- |
| `package.json` | 跨 workspace 的统一命令 | 增加全局命令或根开发依赖 |
| `pnpm-workspace.yaml` | workspace 范围和依赖构建许可 | 增加包或批准依赖安装脚本 |
| `tsconfig.base.json` | 前后端共享 TypeScript 基线 | 修改全项目编译规则 |
| `AGENTS.md` | AI 必须遵守的仓库规则 | 调整开发、文档、验证或提交约定 |
| `docs/` | 设计、ADR、计划、指南和 AI 记录 | 非简单任务必须同步维护 |

### 4.2 `packages/openapi-spec`

这是 API 契约包，不包含业务实现。

- `openapi.yaml`：唯一跨语言 API 契约。
- `src/schema.d.ts`：`pnpm gen:api` 自动生成，禁止手改。
- `src/index.d.ts`：共享泛型类型入口，如 `ApiResponse<T>`、`PaginationRequest`。
- `package.json`：让前端和后端可以通过 `@scaffold/openapi-spec` 引用类型。

修改接口时先改 `openapi.yaml`。如果生成文件与预期不符，应修正 YAML，不要修补 `schema.d.ts`。

### 4.3 `apps/backend`

| 路径 | 作用 |
| --- | --- |
| `src/server.ts` | 读取环境配置并监听端口，只负责进程启动 |
| `src/app.ts` | 组装 Fastify 插件和业务模块，测试直接调用 `buildApp()` |
| `src/config/env.ts` | 加载和校验环境变量 |
| `src/plugins/` | Swagger、数据库、统一响应等横切能力 |
| `src/modules/<module>/` | 按业务能力组织的路由入口 |
| `src/shared/http/` | 响应包装、分页默认值等公共 HTTP 规则 |
| `src/shared/errors/` | 可执行错误码常量 |
| `src/db/schema.ts` | Drizzle 数据模型定义 |
| `src/db/index.ts` | PostgreSQL 客户端和 Drizzle 实例 |
| `drizzle/` | 已生成并需要提交的 SQL 迁移和快照 |
| `test/` | Fastify 路由、契约和公共辅助函数测试 |

`app.ts` 与 `server.ts` 必须保持分离。否则测试导入应用时会直接占用端口，无法使用 Fastify `inject` 进行快速测试。

### 4.4 `apps/frontend`

| 路径 | 作用 |
| --- | --- |
| `src/api/client.ts` | 唯一共享的 `openapi-fetch` Client |
| `src/modules/<module>/composables/` | 封装模块 API 调用和页面状态 |
| `src/views/` | 路由页面，不直接堆积复杂业务和网络逻辑 |
| `src/router/` | Vue Router 配置和页面懒加载 |
| `src/stores/` | 未来的跨页面 Pinia 状态；局部状态不要放入 store |
| `*.test.ts` | Vitest + Vue Test Utils 组件测试 |

前端不能手写一份与后端相似的接口类型，应从 `@scaffold/openapi-spec` 或类型化 API Client 获取。

## 5. OpenAPI 的工作方式

OpenAPI 是一份描述 HTTP 接口的 YAML。常用结构如下：

```yaml
paths:
  /users/{id}:
    get:
      operationId: getUser
      parameters: []
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResponse'

components:
  schemas:
    UserResponse:
      type: object
      required: [status, data]
      properties:
        status:
          type: integer
          enum: [0]
        data:
          $ref: '#/components/schemas/User'
```

关键概念：

- `paths`：URL、HTTP 方法、参数和响应。
- `operationId`：接口稳定名称，必须唯一，生成工具会使用它。
- `components.schemas`：可复用的数据结构。
- `$ref`：引用已有 Schema，避免复制。
- `required`：必须明确列出必填字段；只写 `properties` 不代表字段必填。

修改后执行：

```powershell
pnpm gen:api
pnpm test
pnpm build
```

后端契约测试会比较共享 OpenAPI 和 Fastify Swagger 的关键字段。如果测试失败，通常说明只更新了一侧 Schema。

## 6. 统一响应、错误和分页

### 6.1 普通响应

成功：

```json
{
  "status": 0,
  "data": {}
}
```

失败：

```json
{
  "status": 1003,
  "err": "Resource not found"
}
```

`status` 是业务状态码。项目只把未认证、资源不存在和内部异常分别返回为 HTTP 401、404、500；参数错误、权限不足、冲突、限流和外部依赖错误都返回 HTTP 200，并通过非零 `status` 区分。前端因此不能把 HTTP 200 当成业务成功，仍要判断 `status === 0`。

后端使用公共函数：

```typescript
import { success, failure } from '../../shared/http/response.js'

export function toUserResponse(user: User): ApiResponse<User> {
  return success(user)
}
```

不要在每个路由里临时拼 `{ status: 0, data }`。统一函数可以集中保证约定并便于未来扩展日志或追踪信息。

### 6.2 分页

请求参数：

```typescript
interface PaginationRequest {
  pageNum?: number // 默认 1
  pageSize?: number // 默认 10
}
```

响应：

```json
{
  "status": 0,
  "list": [],
  "total": 0
}
```

后端使用 `normalizePagination()` 应用默认值，使用 `paginatedSuccess()` 创建响应。具体 OpenAPI 接口应声明业务对象数组，例如 `UserPageResponse.list.items -> User`，不要直接以无类型的 `any[]` 结束设计。

### 6.3 错误码

错误码的完整列表和登记流程见[错误码参考](../reference/error-codes.md)。前端只能根据数值错误码执行分支逻辑，`err` 是给人阅读的描述，不是稳定标识。

### 6.4 前端全局响应拦截器

`src/api/client.ts` 为唯一共享 Client，并注册 `globalHttpErrorMiddleware`。拦截器只处理 HTTP 401、404、500，发布 `api:global-http-error` 事件；应用入口可监听事件，统一完成重新登录、跳转 404 页面或显示服务异常提示。

业务 composable 不重复实现这些全局动作。它们只处理 HTTP 200 返回体中的非零 `status`，例如在表单旁显示参数错误、提示权限不足或让用户解决资源冲突。

## 7. 新增一个接口的完整流程

以新增“查询用户详情”为例：

1. 在 `docs/design/modules/` 更新用户模块设计。
2. 在 `docs/plans/active/` 创建实施计划并建立 AI 日志。
3. 在 `openapi.yaml` 定义 `User`、`UserResponse` 和 `/users/{id}`。
4. 执行 `pnpm gen:api`。
5. 在后端用户模块中编写命名处理函数，使用 `success()` 或 `failure()`。
6. 在 Fastify 路由中声明与 OpenAPI 一致的运行时 Schema。
7. 在前端 composable 中通过 `apiClient.GET('/users/{id}', ...)` 调用。
8. 前端业务模块处理 HTTP 200 中的非零 `response.status`；401、404、500 的全局动作由共享拦截器处理。
9. 添加后端路由测试、OpenAPI/Swagger 契约测试和前端状态测试。
10. 运行生成、测试、构建和必要的数据库验证。
11. 更新最终设计和日志，将计划归档。
12. 验证通过后提交 Git 改动。

## 8. 函数代码风格

有名称、可复用、需要堆栈名称的函数使用声明：

```typescript
export async function findUser(id: number): Promise<User | null> {
  return null
}
```

不要默认写成：

```typescript
export const findUser = async (id: number) => {
  return null
}
```

箭头函数仍可用于：

- `map`、`filter`、测试断言等短小回调。
- 必须捕获外层词法 `this` 的闭包。
- 框架 API 明确需要内联函数且抽取名称不会提升可读性的场景。

对象内的简单函数优先使用方法简写，如 `rewrite(path) { ... }`。

## 9. Drizzle 数据库维护

### 9.1 Drizzle 是什么

Drizzle 用 TypeScript 定义数据库结构，并根据 Schema 差异生成 SQL 迁移。`src/db/schema.ts` 描述目标模型，`drizzle/` 记录数据库如何一步步演进。

### 9.2 修改表结构

1. 修改 `apps/backend/src/db/schema.ts`。
2. 运行 `pnpm db:generate`。
3. 人工审查新生成的 SQL，特别关注删除列、修改类型、唯一约束和默认值。
4. 在开发数据库运行 `pnpm db:migrate`。
5. 运行 `pnpm test:db` 和相关业务测试。
6. 提交 Schema、SQL、snapshot 和 journal，缺一不可。

### 9.3 迁移规则

- 已经在共享环境执行过的迁移禁止直接修改。
- 修复已有迁移的问题应生成一条新迁移。
- 任何 `DROP`、数据回填或不可逆类型转换都必须单独设计备份和回滚方案。
- 不得用 `db:push` 代替团队迁移历史。
- 默认测试不依赖真实数据库；数据库集成验证通过 `pnpm test:db` 或专用测试环境运行。

### 9.4 常用数据库命令

```powershell
pnpm db:generate # 生成迁移
pnpm db:migrate  # 应用尚未执行的迁移
pnpm test:db     # 检查连接、版本、users 表和迁移表
```

## 10. Vitest 测试工作方式

Vitest 的断言和 Jest 类似，但与 Vite/TypeScript 集成更直接。

### 10.1 后端测试

后端通过 `buildApp({ logger: false })` 创建实例，再用 `app.inject()` 发送内存请求。它不会监听端口，也不要求启动浏览器。

测试至少检查：

- HTTP 状态码。
- 业务 `status`、`data` 或 `err`。
- 日期、枚举和分页等关键字段。
- OpenAPI 与 Swagger 的契约一致性。

### 10.2 前端测试

前端使用 Vue Test Utils 的 `mount()` 渲染组件。页面测试通常 mock composable，从而稳定验证 loading、success、error 和用户交互，不访问真实后端。

### 10.3 命令

```powershell
pnpm test       # 一次性运行全部测试
pnpm test:watch # 开发时监听
```

修复缺陷时先写一个能失败的复现测试，再修改实现。测试不能依赖执行顺序、外网或个人数据库数据。

## 11. 文档和提交规则

非简单改动必须同时维护：

- `docs/design/`：最终有效设计。
- `docs/decisions/`：长期技术取舍。
- `docs/plans/active/`：正在执行的计划。
- `docs/ai-logs/`：人与 AI 的结构化协作摘要。

完成后更新实际结果，将计划移动到 `archive/`。所有约定验证通过后必须提交 Git；验证失败或存在归属不明改动时不得勉强提交。

## 12. 常见问题

### 修改 OpenAPI 后前端类型没有变化

确认运行了 `pnpm gen:api`，并检查生成目标 `packages/openapi-spec/src/schema.d.ts`。不要运行后再手改生成文件。

### Swagger 和 OpenAPI 契约测试失败

检查 Fastify 路由 `schema.response` 是否同步了外层统一响应、必填字段、枚举和具体 `data` 类型。

### 数据库迁移没有生成

确认修改的是 `src/db/schema.ts`，并从仓库根运行 `pnpm db:generate`。首次运行 Drizzle Kit 可能需要系统允许其创建本地工作目录。

### 测试不应连接数据库，为什么仍需要 DATABASE_URL

应用组装会注册数据库插件，但 PostgreSQL 客户端是延迟连接的。Vitest 配置提供了不会实际访问的测试 URL；只有显式数据库测试才连接真实 PostgreSQL。

### 构建后源码目录出现 `.js`

前端 `tsconfig.json` 必须保留 `noEmit: true`。`vue-tsc` 负责类型检查，真正的构建产物只能由 Vite 输出到 `dist/`。
