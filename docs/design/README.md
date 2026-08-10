# 当前设计索引

只打开与任务范围直接相关的文档。系统级变更先读系统设计，模块内变更再读对应模块设计；历史设计从[归档索引](../archive/README.md)按需查找。

## 系统级

- [系统概览](system-overview.md)：定位、技术链路、当前能力和已知缺口。
- [CYBER 品牌与视觉系统](branding.md)：Cyber AI Forge 产品与创作者品牌边界、Logo、视觉语言和品牌化技术标识。
- [开源推广站](marketing-site.md)：GitHub Pages 静态站边界、双语内容、滚动三维展示、视觉系统与部署验证。
- [模块边界](module-boundaries.md)：独立目录、公共文件、依赖和数据所有权；新模块或跨模块改动必读。
- [分层文档与历史归档](documentation-governance.md)：最小阅读协议和文档生命周期；文档治理任务必读。
- [测试与验证策略](testing-strategy.md)：后端/契约自动化、数据库验证和前端人工验收边界。
- [开发工作流](developer-workflow.md)：源码别名、项目格式配置、编辑器和 Git 自动格式化。
- [数据库 Schema 与迁移基线](database-schema-and-migrations.md)：`sys_` 系统表命名、单一初始迁移和全新数据库切换边界。
- [UUIDv7 标识符与空库基线](uuid-identifier-model.md)：单一实体 ID、空值语义、PostgreSQL 18 和不兼容空库迁移边界。
- [授权数据库模型](authorization-database-model.md)：功能权限与数据权限的表关系、字段语义、约束和运行时查询。

## Workspace 与模块

- [API 契约](modules/api-contract.md) · [后端](modules/backend.md) · [前端应用与应用壳](modules/frontend.md)
- [认证](modules/auth.md) · [授权与数据范围](modules/authorization.md) · [用户](modules/users.md) · [角色](modules/roles.md) · [部门](modules/departments.md) · [岗位](modules/positions.md)
- [菜单](modules/menus.md) · [字典](modules/dictionaries.md)
- [接口日志](modules/api-logs.md)
- [前端导航](modules/navigation.md) · [前端运行时多语言](modules/localization.md) · [标签历史](modules/tag-view.md) · [系统设置](modules/settings.md) · [工作台](modules/home.md) · [健康检查](modules/health.md) · [关于项目](modules/about.md) · [错误页面](modules/errors.md)

新增一级模块时增加对应设计文档，并登记职责、边界、公共文件、依赖、数据流、失败模式和测试策略。

- [前端主题色一致性](theme-color-consistency.md)：前端主题语义令牌、页面覆盖范围和验收边界。
