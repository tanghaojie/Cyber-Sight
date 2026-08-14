---
title: Nest Provider 作为后端依赖边界
status: accepted
date: 2026-08-08
---

# ADR-0036：Nest Provider 作为后端依赖边界

## 背景

NestJS 迁移初期以 `BackendRuntime` 聚合数据库、JWT token cache 和授权 Provider，再把该对象传给 Controller、Guard、repository 和普通 service 函数。随着系统模块增加，这个聚合对象隐藏了真实依赖，并允许模块访问与自身职责无关的运行时能力。

## 决策驱动因素

- 模块边界需要通过构造函数显式表达依赖。
- 认证、授权、数据库和业务仓储要能独立替换和测试。
- 不改变既有 HTTP、数据库、JWT 会话和授权语义。
- 保留 `buildApp()` 对数据库、JWT secret 和授权 Provider 的测试注入能力。

## 考虑的方案

1. 继续把所有依赖放入 `BackendRuntime`。
2. 只迁移认证和 JWT，暂时保留其余 runtime 访问。
3. 使用 Nest 自定义 Provider 管理基础设施，所有 repository、access 和 application service 使用 `@Injectable()` class。

## 决策

选择方案 3。数据库通过稳定的 Nest Provider token 暴露；`JwtModule` 管理 JWT 工具，`JwtTokenCache`、`AuthService`、授权服务、repository、access 和 application service 通过构造函数注入它们的最小依赖。模块之间只能依赖登记的公共 Provider 和应用服务，不再传递 `BackendRuntime` 聚合对象。

## 正面结果

- 依赖关系可从构造函数直接阅读和审查。
- 单元测试可以按 Provider 覆盖数据库、JWT 和授权实现。
- 移除运行时聚合对象后，模块不能隐式访问其他能力。
- 认证与授权公共服务更符合 Nest 模块生命周期和组合根设计。

## 负面结果与风险

- 初次迁移会触及多个模块、测试和文档。
- Drizzle 数据库客户端需要使用自定义 Provider token，因为其接口没有运行时 class。
- 模块导入关系必须避免认证、授权和管理模块循环依赖。
- `@nestjs/jwt` 底层使用 `jsonwebtoken`，需要回归验证现有 JWT claims 与校验约束。

## 验证和复审条件

- 后端构建、格式、测试和集成 HTTP 回归通过。
- 静态搜索不再发现 `BackendRuntime` 生产代码依赖。
- `pnpm docs:archive:check:ci` 返回通过状态。
- 如果未来引入外部授权或多实例共享缓存，复审 Provider 的边界和生命周期。

## 相关设计和计划

- [后端模块设计](../design/modules/backend.md)
- [认证模块](../design/modules/auth.md)
- [授权与数据范围模块](../design/modules/authorization.md)
- [实施计划](../archive/plans/2026-08-08-injectable-backend-runtime.md)
