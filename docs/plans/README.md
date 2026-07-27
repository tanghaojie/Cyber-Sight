# 实施计划索引

## 进行中

当前没有进行中的计划。

## 已归档

- [AI-Friendly Web Scaffold 初始实施计划](archive/2026-06-05-ai-friendly-web-scaffold.md)：由 Superpowers 工作流生成的原始计划。
- [文档治理与 AI 强制规则](archive/2026-07-22-documentation-governance.md)：建立统一文档结构、模板和仓库级 AI 规则。
- [测试、统一接口类型与 PostgreSQL 开发环境](archive/2026-07-22-testing-contract-database-baseline.md)：建立测试、共享类型、迁移和本地数据库基线。
- [人类维护指南、函数风格与统一 API 响应](archive/2026-07-22-maintainer-guide-and-api-response-standard.md)：统一人类开发流程、代码风格、响应、分页和错误码。
- [HTTP 状态策略与前端全局拦截器](archive/2026-07-22-http-status-and-global-interceptor.md)：限定全局 HTTP 错误并区分前端全局与业务模块处理边界。
- [管理系统基础能力](archive/2026-07-22-management-system-foundation.md)：统一软删除审计、认证、管理 API 和现代化管理前端。
- [共享运行时 Schema 契约迁移](archive/2026-07-23-runtime-schema-contract.md)：用单一可执行 Schema 替换 OpenAPI-first 双源链路。
- [Zod Schema 统一迁移](archive/2026-07-23-zod-schema-unification.md)：以 Zod 4 统一环境变量和 HTTP 契约的 Schema 编写 API。
- [前端应用壳组件化与动态页面加载](archive/2026-07-23-frontend-shell-componentization.md)：引入 Tailwind CSS 与 Element Plus，拆分布局组件并实现菜单路由动态加载。
- [模块隔离与独立目录约束](archive/2026-07-27-module-isolation-constraints.md)：强制业务模块使用独立目录、公共入口、单向依赖和明确数据所有权。
- [JTLab 品牌、动态导航与前端模块拆分](archive/2026-07-27-jtlab-dynamic-navigation.md)：统一品牌主题，以数据库菜单树驱动路由并拆分四个基础资料模块。
- [旧菜单数据兼容与导航容错](archive/2026-07-27-legacy-menu-compatibility.md)：兼容存量菜单读取，过滤无效导航，修复动态 URL 首次匹配与侧栏默认隐藏。
- [AI Git 暂存区门禁与提交署名](archive/2026-07-27-ai-git-safety-and-attribution.md)：阻止 AI 混入人类既有暂存内容，并强制 AI 提交记录真实模型名称。
- [前端模块页面自动注册与 SCSS 重构](archive/2026-07-27-frontend-registry-and-scss.md)：自动发现模块页面注册文件，分层迁移全局 SCSS 并提高侧栏对比度。
- [前端模块表意公共文件迁移](archive/2026-07-27-semantic-module-entry-files.md)：删除前端模块级 `index.ts`，改用按职责命名并登记的公共文件。
- [前端应用壳流式布局重构](archive/2026-07-27-frontend-layout-refactor.md)：修复侧栏脱离布局流后遮挡主内容和顶栏的问题，统一桌面网格与移动抽屉边界。
- [菜单编码软删除唯一性修复](archive/2026-07-27-menu-code-soft-delete-uniqueness.md)：以部分唯一索引允许菜单编码在软删除后复用。

## 使用规则

- 非简单改动开始前，从[计划模板](../templates/implementation-plan-template.md)创建文件。
- 计划必须写清范围、非目标、依赖、任务、验证和回滚策略。
- 实施时更新复选框和偏差，不要让计划停留在最初设想。
- 完成、取消或被替代后移入 `archive/`，并保留最终状态和原因。
