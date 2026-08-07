# 后端模块设计

## 定位

`apps/backend` 是默认服务端实现，使用 NestJS + Fastify adapter + TypeScript。Java 不是当前并行实现，只有现实需求出现时才建立跨语言迁移方案。

## 当前结构

- `src/app.ts`：可测试的应用组装函数。
- `src/app.module.ts`：Nest 根模块、全局 Guard、Filter 和 Interceptor 组装。
- `src/server.ts`：进程启动、端口监听与启动失败处理。
- `src/shared/runtime/`：数据库 Provider 和进程生命周期的组合根适配；业务依赖通过 Nest Provider 注入，不再传递聚合式 `BackendRuntime`。
- `src/modules/system/`：脚手架内置系统能力；`src/modules/biz/`：后续产品业务能力。
- `src/db/`：Drizzle Schema 聚合入口、按数据所有权拆分的 Schema 分片与数据库客户端。
- `drizzle.config.ts`：数据库迁移生成配置。
- `src/modules/system/auth/`：密码散列、JWT、数据库 token 会话、进程内 LRU 读缓存、登录/退出和当前用户解析。
- `src/modules/system/authorization/`：可注入 Provider、路由声明门禁、功能权限和数据范围解析。
- `src/modules/system/api-logs/`：业务 API 最小日志采集、有界批量写入、90 天清理和管理员分页查询。
- `src/modules/system/departments/`：部门树、闭包关系、管理 API 和公共组织查询。
- `src/modules/system/users|roles|menus|dictionaries/`：独立管理 API 与仓储；菜单模块额外提供按有效权限过滤的当前用户导航树。

应用组装与网络监听必须分离，使测试可以通过底层 Fastify `inject` 验证完整 Nest 应用而不占用端口。环境变量由集中配置模块加载和校验，数据库客户端由 Nest 生命周期负责释放。

业务端点由 Nest Controller 声明，并通过装饰器显式选择 `public`、`authenticated` 或 `permission(anyOf)`；全局 `AuthorizationGuard` 拒绝缺少声明的业务处理器。数据库使用稳定的 Nest Provider token，认证模块通过 `JwtModule` 和 `JwtTokenCache` 管理 JWT；`RuntimeModule` 只组合数据库、JWT secret 与生命周期，`AppModule` 通过 `AuthorizationModule.register()` 组装可替换的 `AuthorizationProvider`。`buildApp()` 可覆盖数据库、JWT 配置和授权 Provider。

`src/shared/http/` 提供 Zod Pipe、契约装饰器、响应 Interceptor、异常 Filter 和响应辅助函数；`src/shared/errors/` 维护错误码与 Nest HTTP 异常构造器。全局 Filter 把校验失败、未找到路由和未捕获异常转换为统一错误响应。

全局 Filter 先依据原始 Nest HTTP 状态选择业务错误码，再决定对外 HTTP 状态。只有未认证、未找到和内部异常分别保留为 HTTP `401`、`404`、`500`；校验失败、权限不足、冲突、限流和外部依赖错误都以 HTTP `200` 返回非零业务 `status`。

## 模块边界

每个业务能力必须在 `src/modules/system/<module>/` 或 `src/modules/biz/<module>/` 建立独立目录，并以 `<module>.module.ts`、`<module>.controller.ts`、`<module>.service.ts` 等表意文件暴露 Nest 模块、HTTP 入口、应用服务或公共类型，避免新增 `index.ts` barrel。应用组装只能从设计中登记的公共文件注册模块；模块之间禁止导入未登记的内部文件，也不能直接使用其他模块的仓储、数据库表或私有 Schema。存量入口在模块实质修改时逐步迁移。

随着业务增加，每个模块应在自己的目录内按需要分成：

- 路由层：HTTP 输入输出、鉴权入口和状态码映射。
- 应用层：用例编排和事务边界。
- 领域层：可独立测试的业务规则。
- 基础设施层：数据库、消息、文件和外部服务适配器。

小型模块可以在模块目录内合并文件，但不能省略独立目录，也不能把核心业务规则永久写在路由处理函数中。跨模块协作通过公共应用服务、端口或事件完成，依赖必须单向且无循环。`src/db/` 只保留连接、迁移聚合等平台能力；新增或实质修改的业务表定义及仓储适配器由其所有者模块管理。Repository、access 和 application service 使用 `@Injectable()` class，并只注入其实际需要的数据库、认证或授权 Provider；不得通过共享运行时对象取得额外能力。

所有有名称的函数优先使用函数声明。箭头函数只用于短小回调、闭包或必须保持词法作用域的场景，禁止使用 `const fn = () => {}` 作为默认函数定义方式。

## HTTP 边界与运行时校验

Nest Controller 必须通过 `ZodValidationPipe` 使用 `@scaffold/api-contract` 提供的请求体、查询参数和路径参数 Schema，并通过 `ContractRoute` 绑定响应 Schema 与 OpenAPI 元数据。参数类型必须从相同 Schema 推导；类型标注不能替代运行时校验。

共享请求 Schema 使用严格对象；未声明字段必须由 Zod Pipe 触发统一参数错误，不能被静默删除后继续执行处理函数。HTTP 查询和路径中的数字由契约中的 `z.coerce.number()` 在边界转换。

响应由 `ContractResponseInterceptor` 使用同一 Zod Schema 校验；OpenAPI Schema 由契约包转换生成。Fastify Zod Type Provider 不进入 Controller 主链路，避免形成与 Nest Pipe/Interceptor 并行的第二套校验生命周期。

## Java 引入边界

只有出现 TypeScript 生态无法合理满足的功能、既有 Java 资产复用、运行时限制或团队交付要求时才切换。替换时保持以下边界稳定：

- 当前 HTTP 路径、语义和错误模型。
- 数据所有权与迁移方案。
- 可观测性、安全和部署契约。

Java 引入不是简单代码生成，需要独立的设计、ADR、迁移计划和契约回归测试。立项后从 Nest Swagger `/docs/json` 导出并审查 OpenAPI，建立版本化的跨语言边界；在此之前不手写维护第二份契约。

## 数据库开发基线

- 本地连接信息只写入被 Git 忽略的 `apps/backend/.env`。
- `.env.example` 只提供无敏感信息的示例。
- Drizzle 迁移文件进入版本控制，数据库结构变化通过迁移执行。
- 默认单元和路由测试不得依赖本机数据库；数据库集成验证使用独立命令显式运行。
- 所有业务表包含 `is_deleted`、`created_at`、`created_by`、`updated_at`、`updated_by`；仓储查询显式过滤软删除数据。
- 14 张脚手架表使用 `sys_` 物理前缀，映射和例外见[数据库 Schema 与迁移基线](../database-schema-and-migrations.md)。
- 当前 `0000_initial_system_schema` 单一基线只面向全新空数据库；旧库数据保留或搬迁必须另写方案。
- `src/db/schema.ts` 是稳定聚合入口，具体表定义位于 `src/db/schema/`。分片按表的数据所有权组织，外键依赖通过显式 `.js` 导入表达；迁移生成必须能加载完整聚合入口且不产生无关 DDL。

## 可维护性说明

后端源码使用中文注释记录非直观的设计意图、边界条件和安全约束，重点覆盖认证会话、授权范围、异步审计写入、组织树闭包表，以及统一 HTTP 错误映射。注释应解释“为什么这样做”和改动时必须保持的约束，不重复 TypeScript 类型、变量名或显而易见的流程；注释本身不改变模块公共接口、数据流或运行时行为。

## 仍待解决

- 健康检查目前是存活检查，不验证数据库 readiness。
- 管理模块已提供路由、认证服务和基础设施仓储分离示例；更复杂领域用例仍需继续拆分应用层与领域层。
- PostgreSQL 绑定存在于 Schema、驱动和 Drizzle 配置多个位置。
