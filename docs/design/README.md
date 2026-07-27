# 设计文档索引

设计文档描述当前有效的系统结构。实现发生变化时，应直接更新相关设计文档；历史原因和取舍写入 ADR。

## 系统级设计

- [系统概览](system-overview.md)：目标、边界、核心原则和演进方向。
- [模块边界与独立目录](module-boundaries.md)：业务模块的目录、公共入口、依赖方向、数据所有权和迁移门禁。
- [文档治理](documentation-governance.md)：文档类型、生命周期和 AI 文档门禁。
- [测试策略](testing-strategy.md)：测试分层、默认测试边界和契约校验。
- [管理系统基础能力](management-system.md)：认证、软删除审计、基础资料模块和管理端框架。
- [前端应用壳与动态页面](frontend-shell.md)：Tailwind CSS、Element Plus、布局组件边界和路由驱动的内容加载。
- [JTLab 品牌、主题与数据库动态导航](dynamic-navigation-and-branding.md)：可配置品牌、绿色主题、数据库菜单树、受控页面加载和全局错误行为。

## 模块设计

- [API 契约](modules/api-contract.md)：共享运行时 Schema、类型推导和边界校验。
- [后端](modules/backend.md)：Fastify 默认实现、运行时校验及未来 Java 引入边界。
- [前端](modules/frontend.md)：Vue 应用结构、API 使用方式和业务边界。
- [用户](modules/users.md)：用户资料、角色归属和独立管理页面。
- [角色](modules/roles.md)：角色资料、菜单授权和独立管理页面。
- [菜单](modules/menus.md)：菜单 CRUD、树结构、当前用户导航和动态页面标识。
- [字典](modules/dictionaries.md)：通用字典项和独立管理页面。
- [认证](modules/auth.md)：登录会话、当前用户与前端认证状态。
- [前端导航](modules/navigation.md)：当前用户菜单树缓存与动态导航输入。
- [工作台](modules/home.md)：基于当前用户导航生成的管理总览。

新增一级模块时，必须增加对应设计文档并更新本索引。
