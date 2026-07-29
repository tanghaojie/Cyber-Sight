# 当前设计索引

只打开与任务范围直接相关的文档。系统级变更先读系统设计，模块内变更再读对应模块设计；历史设计从[归档索引](../archive/README.md)按需查找。

## 系统级

- [系统概览](system-overview.md)：定位、技术链路、当前能力和已知缺口。
- [模块边界](module-boundaries.md)：独立目录、公共文件、依赖和数据所有权；新模块或跨模块改动必读。
- [分层文档与历史归档](documentation-governance.md)：最小阅读协议和文档生命周期；文档治理任务必读。
- [测试与验证策略](testing-strategy.md)：后端/契约自动化、数据库验证和前端人工验收边界。
- [开发工作流](developer-workflow.md)：源码别名、项目格式配置、编辑器和 Git 自动格式化。

## Workspace 与模块

- [API 契约](modules/api-contract.md) · [后端](modules/backend.md) · [前端应用与应用壳](modules/frontend.md)
- [认证](modules/auth.md) · [用户](modules/users.md) · [角色](modules/roles.md)
- [菜单](modules/menus.md) · [字典](modules/dictionaries.md)
- [前端导航](modules/navigation.md) · [工作台](modules/home.md) · [错误页面](modules/errors.md)

新增一级模块时增加对应设计文档，并登记职责、边界、公共文件、依赖、数据流、失败模式和测试策略。
