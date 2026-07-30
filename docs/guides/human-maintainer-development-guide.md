# 人类维护者开发指南

## 1. 这份指南适合谁

本项目虽然以 AI 辅助开发为主，但所有实现必须能够由全栈工程师阅读、调试和修改。本指南面向熟悉 TypeScript、Vue、Node.js 和关系型数据库，但不熟悉 Zod、Drizzle ORM、后端 Vitest 或前端人工验收边界的维护者。

阅读完后，你应该能够：

- 判断一个改动应该落在哪个包或模块。
- 新增或修改一个前后端接口。
- 理解并维护统一响应、分页和错误码。
- 修改数据库 Schema、生成和执行迁移。
- 编写后端路由与契约测试，并人工验收前端功能和浏览器行为。
- 按项目文档和 Git 规则完成一次可回溯交付。

## 2. 项目的整体思路

项目是 pnpm workspace，包含一个共享契约包和两个应用：

```text
packages/api-contract
        |                         运行时 Schema + 推导类型
        +------------------+
        |                  |
        v                  v
apps/frontend          apps/backend
Vue 3 + fetch Client   Fastify 校验 + Swagger
```

最重要的原则是“可执行契约优先”：接口数据变化先改共享 Zod Schema，后端使用由它生成的 JSON Schema 校验真实请求，前后端类型从它推导。不要分别手写相似 interface，再靠人脑保持同步。

## 3. 开发环境与首次启动

### 3.1 前置软件

- Node.js：当前开发环境使用 Node.js 24。
- pnpm：当前使用 pnpm 11。
- PostgreSQL：本地或容器均可，连接字符串使用标准 PostgreSQL URL。

### 3.2 初始化

```powershell
pnpm install
Copy-Item apps/backend/.env.example apps/backend/.env
# 编辑 apps/backend/.env，填写全新空数据库的 DATABASE_URL 和至少 32 个字符的 JWT_SECRET
pnpm db:migrate
pnpm dev
```

当前单一迁移基线不兼容旧数据库。已有旧迁移记录或未加 `sys_` 前缀表的数据库不能继续使用；切换步骤见[数据库基线重建指南](database-baseline-rebuild.md)。

默认地址：

- 前端：`http://localhost:5173`
- 后端：`http://localhost:3000`
- Swagger UI：`http://localhost:3000/docs`
- Swagger JSON：`http://localhost:3000/docs/json`

本地 `.env` 被 Git 忽略，禁止把真实密码复制到 README、设计文档、测试或提交记录中。

## 4. 目录和模块职责

### 4.1 仓库根目录

| 文件或目录            | 作用                            | 修改时机                       |
| --------------------- | ------------------------------- | ------------------------------ |
| `package.json`        | 跨 workspace 的统一命令         | 增加全局命令或根开发依赖       |
| `pnpm-workspace.yaml` | workspace 范围和依赖构建许可    | 增加包或批准依赖安装脚本       |
| `tsconfig.base.json`  | 前后端共享 TypeScript 基线      | 修改全项目编译规则             |
| `AGENTS.md`           | AI 必须遵守的仓库规则           | 调整开发、文档、验证或提交约定 |
| `docs/`               | 设计、ADR、计划、指南和 AI 记录 | 非简单任务必须同步维护         |

### 4.2 `packages/api-contract`

这是 API 数据契约包，不包含业务实现。

- `src/index.ts`：共享 Zod Schema、`z.infer` 推导的请求/响应类型、Draft 7 转换函数和统一响应泛型。
- `package.json`：让前端和后端通过 `@scaffold/api-contract` 消费同一契约。
- `dist/`：构建产物，不作为手工编辑源。

修改接口时先改共享 Schema。后端路由必须直接引用该 Schema，前端业务 API 使用其导出的类型。

### 4.3 `apps/backend`

| 路径                           | 作用                                                   |
| ------------------------------ | ------------------------------------------------------ |
| `src/server.ts`                | 读取环境配置并监听端口，只负责进程启动                 |
| `src/app.ts`                   | 组装 Fastify 插件和业务模块，测试直接调用 `buildApp()` |
| `src/config/env.ts`            | 加载和校验环境变量                                     |
| `src/plugins/`                 | Swagger、数据库、统一响应等横切能力                    |
| `src/modules/system/<module>/` | 脚手架内置系统能力的路由入口                           |
| `src/modules/biz/<module>/`    | 产品业务能力的路由入口                                 |
| `src/shared/http/`             | 响应包装、分页默认值等公共 HTTP 规则                   |
| `src/shared/errors/`           | 可执行错误码常量                                       |
| `src/db/schema.ts`             | Drizzle 数据模型定义                                   |
| `src/db/index.ts`              | PostgreSQL 客户端和 Drizzle 实例                       |
| `drizzle/`                     | 已生成并需要提交的 SQL 迁移和快照                      |
| `test/`                        | Fastify 路由、契约和公共辅助函数测试                   |

`app.ts` 与 `server.ts` 必须保持分离。否则测试导入应用时会直接占用端口，无法使用 Fastify `inject` 进行快速测试。

业务模块必须在所属类别下拥有独立的 `src/modules/system/<module>/` 或 `src/modules/biz/<module>/` 目录，并以 `<module>.routes.ts`、`<module>.service.ts`、`<module>.api.ts` 等表意文件公开稳定能力，避免创建 `index.ts` barrel。路由、应用服务、领域规则、仓储和业务数据模型放在该模块目录内；`app.ts` 只从设计中登记的公共文件注册模块。不得导入其他模块未登记的内部文件，也不得直接访问其他模块的仓储或数据表。

### 4.4 `apps/frontend`

| 路径                                             | 作用                                             |
| ------------------------------------------------ | ------------------------------------------------ |
| `src/api/client.ts`                              | 唯一共享的 fetch Client                          |
| `src/modules/{system,biz}/<module>/composables/` | 封装模块 API 调用和页面状态                      |
| `src/modules/{system,biz}/<module>/pages/`       | 模块拥有的路由页面，不直接堆积复杂业务和网络逻辑 |
| `src/router/`                                    | Vue Router 配置和页面懒加载                      |
| `src/stores/`                                    | 未来的跨页面 Pinia 状态；局部状态不要放入 store  |
| `vite.config.mts`                                | Vite 构建、源码别名和 SVG 图标插件配置           |

前端不能手写一份与后端相似的接口类型，应从 `@scaffold/api-contract` 获取。

新业务页面、组件、composable、service 和局部 store 都归入对应 `src/modules/system/<module>/` 或 `src/modules/biz/<module>/`，由 `registerViews.ts`、`*.routes.ts`、`*.store.ts` 等表意文件暴露路由或应用壳需要的能力。根级 `views`、`stores` 只保留存量或真正应用级能力；实质修改存量业务时应迁入模块目录。

前端不维护单元、组件或端到端自动化测试。功能、交互、错误状态和浏览器适配由维护者人工
验收；AI 默认只执行格式、TypeScript 检查和生产构建，不运行前端或浏览器测试。

### 4.5 模块边界检查

新增或实质修改模块前，先阅读[模块边界与独立目录](../design/module-boundaries.md)，并确认：

1. 前端、后端和契约使用同一个稳定模块名。
2. 模块所有业务文件位于独立目录，并以最小、表意的公共文件暴露能力。
3. 跨模块引用只指向设计登记的公共文件，没有未登记的内部导入或循环依赖。
4. 业务数据有唯一所有者，其他模块不会绕过接口直接访问其 store、仓储或表。
5. `shared` 中没有为逃避归属判断而放入的业务代码。
6. 后端/契约模块用自动化测试覆盖公共边界；前端模块列出维护者人工验收场景。

## 5. 运行时 Schema 的工作方式

TypeScript interface 在运行时不存在，不能阻止 curl、旧客户端或被篡改的请求提交非法 JSON。共享契约使用 Zod 4 定义运行时 Schema 并推导 TypeScript 类型：

```typescript
import { z } from 'zod'

export const UserRequestSchema = z.strictObject({
  name: z.string().min(1).max(80),
  enabled: z.boolean(),
})

export type UserRequest = z.infer<typeof UserRequestSchema>
```

Fastify 路由挂载由这个 Schema 派生的 JSON Schema：

```typescript
import { toFastifySchema } from '@scaffold/api-contract'

app.post<{ Body: UserRequest }>(
  '/users',
  { schema: { body: toFastifySchema(UserRequestSchema) } },
  async function createUser(request) {
    // request.body 已通过真实运行时校验
  },
)
```

关键规则：

- 请求对象使用 `z.strictObject()`，生成 `additionalProperties: false`。
- 必填、长度、范围、格式和枚举写在 Schema 中。
- 类型始终从 Schema 推导，不再平行手写。
- 路由通过 `toFastifySchema()` 生成 Draft 7 JSON Schema；不要手写转换结果。
- HTTP 契约不得使用无法转换为 JSON Schema 的 `transform`、`Date`、`Map`、`Set` 等能力。
- `/docs/json` 由 Fastify 路由生成 OpenAPI，用于调试；不再编辑第二份 YAML。

修改后执行：

```powershell
pnpm test
pnpm build
```

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

后端使用 `normalizePagination()` 应用默认值，使用 `paginatedSuccess()` 创建响应。具体共享 Schema 应声明业务对象数组，例如 `paginatedResponseSchema(UserSummarySchema)`，不要直接以无类型的 `any[]` 结束设计。

### 6.3 错误码

错误码的完整列表和登记流程见[错误码参考](../reference/error-codes.md)。前端只能根据数值错误码执行分支逻辑，`err` 是给人阅读的描述，不是稳定标识。

### 6.4 前端全局响应拦截器

`src/api/client.ts` 为唯一共享 Client，并在收到响应后调用已注册的全局 HTTP 错误处理器。它只处理 HTTP 401、404、500；应用入口注入清会话、跳转登录或 404 页面以及 ElMessage 服务异常提示。HTTP 200 中的非零业务状态仍由发起请求的模块处理。

业务 composable 不重复实现这些全局动作。它们只处理 HTTP 200 返回体中的非零 `status`，例如在表单旁显示参数错误、提示权限不足或让用户解决资源冲突。

## 7. 新增一个接口的完整流程

以新增“查询用户详情”为例：

1. 在 `docs/design/modules/` 更新用户模块设计。
2. 在 `docs/plans/active/` 创建实施计划并建立 AI 日志。
3. 确认前端、后端分别使用 `src/modules/system/users/`，契约使用 `src/modules/users/`，并只依赖已登记的表意公共文件。
4. 在 `@scaffold/api-contract` 的用户模块中定义请求、路径和响应 Schema，并从模块入口导出推导类型。
5. 在后端用户模块中编写命名处理函数，使用 `success()` 或 `failure()`。
6. 在 Fastify 路由中直接挂载共享运行时 Schema。
7. 在前端用户模块中以契约类型调用共享 Client。
8. 前端业务模块处理 HTTP 200 中的非零 `response.status`；401、404、500 的全局动作由共享拦截器处理。
9. 添加合法/非法输入路由测试和 Swagger 生成测试，列出前端成功、失败与交互验收场景。
10. 检查没有跨模块深层导入、循环依赖或直接访问其他模块数据。
11. 运行适用的后端/契约测试、构建和必要的数据库验证；前端行为由维护者人工验收。
12. 更新最终设计和日志，将计划归档。
13. 验证通过后提交 Git 改动。

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

Drizzle 用 TypeScript 定义数据库结构，并根据 Schema 差异生成 SQL 迁移。`src/db/schema.ts` 描述目标模型，`drizzle/` 记录数据库如何一步步演进。脚手架自带表的物理名称统一以 `sys_` 开头，TypeScript 表对象保留简洁的模块语义名。

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
- 当前 `0000_initial_system_schema` 是维护者明确批准的一次性历史重置，只能在全新空数据库执行；从该基线开始恢复“已执行迁移不可改写”的常规规则。

### 9.4 常用数据库命令

```powershell
pnpm db:generate # 生成迁移
pnpm db:migrate  # 在全新空数据库应用尚未执行的迁移
pnpm test:db     # 检查连接、版本、sys_users 表和迁移表
```

## 10. 测试与前端人工验收

Vitest 只用于后端自动化测试。`apps/frontend` 不提供测试脚本或测试环境。

### 10.1 后端测试

后端通过 `buildApp({ logger: false })` 创建实例，再用 `app.inject()` 发送内存请求。它不会监听端口，也不要求启动浏览器。

测试至少检查：

- HTTP 状态码。
- 业务 `status`、`data` 或 `err`。
- 日期、枚举和分页等关键字段。
- 非法 HTTP 输入被共享 Schema 在处理函数前拒绝。
- Swagger 包含路由声明的操作和关键约束。

### 10.2 前端人工验收

维护者根据具体改动人工检查前端，至少考虑：

- loading、empty、error 和 success 状态。
- 表单校验、新增/编辑 Dialog、删除确认和分页刷新。
- HTTP 401、404、500 与 HTTP 200 非零业务状态。
- 直接地址、动态菜单、桌面布局和窄屏交互。

AI 不运行这些浏览器场景，除非维护者在具体任务中重新明确授权。

### 10.3 命令

```powershell
pnpm test       # 契约构建校验和后端测试，不包含前端
pnpm test:watch # 监听后端测试，不包含前端
pnpm --filter @scaffold/frontend build # 前端类型检查和生产构建，不是功能测试
```

修复后端缺陷时先写一个能失败的复现测试，再修改实现。测试不能依赖执行顺序、外网或个人
数据库数据。修复前端缺陷时记录维护者需要复验的场景，不新增自动化测试。

## 11. 文档和提交规则

非简单改动必须同时维护：

- `docs/design/`：最终有效设计。
- `docs/decisions/`：长期技术取舍。
- `docs/plans/active/`：正在执行的计划。
- `docs/ai-logs/`：尚未结束任务的人与 AI 结构化协作摘要。

完成后更新实际结果，将计划和 AI 日志分别移动到 `docs/archive/plans/`、`docs/archive/ai-logs/`。历史资料默认不读取，需要复盘时从 `docs/archive/README.md` 定位。所有约定验证通过后必须提交 Git；验证失败或存在归属不明改动时不得勉强提交。

## 12. 常见问题

### 修改 Schema 后前端类型没有变化

确认类型通过 `z.infer<typeof Schema>` 推导，并从 `@scaffold/api-contract` 导出。不要在前端保留同名的旧 interface。

### TypeScript 已通过，为什么非法请求仍进入处理函数

类型不会执行运行时校验。检查 Fastify 路由是否通过 `toFastifySchema()` 真正设置了 `schema.body`、`schema.querystring` 或 `schema.params`，并添加 `inject` 非法输入测试。

### 数据库迁移没有生成

确认修改的是 `src/db/schema.ts`，并从仓库根运行 `pnpm db:generate`。首次运行 Drizzle Kit 可能需要系统允许其创建本地工作目录。

### 测试不应连接数据库，为什么仍需要 DATABASE_URL

应用组装会注册数据库插件，但 PostgreSQL 客户端是延迟连接的。Vitest 配置提供了不会实际访问的测试 URL；只有显式数据库测试才连接真实 PostgreSQL。

### 构建后源码目录出现 `.js`

前端 `tsconfig.json` 必须保留 `noEmit: true`。`vue-tsc` 负责类型检查，真正的构建产物只能由 Vite 输出到 `dist/`。
