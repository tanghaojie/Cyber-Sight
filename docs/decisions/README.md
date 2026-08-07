# 现行架构决策索引

本目录只保留初始版本之后仍需要解释的长期决策。当前技术事实优先从[设计索引](../design/README.md)、共享契约、测试和代码读取；初始版本形成过程中的 ADR-0001 至 ADR-0023 已完整归档。

## 当前决策

- [ADR-0024](ADR-0024-human-authored-state-authority.md)：人类修改优先，初始版本实现与精简设计构成当前基线，发现冲突或问题时由人类决定下一步。
- [ADR-0025](ADR-0025-pluggable-authorization-and-data-scope.md)：默认使用本地可插拔授权 Provider，以稳定权限键和查询计划实现功能与数据权限。
- [ADR-0026](ADR-0026-system-table-prefix-and-fresh-baseline.md)：框架表统一使用 `sys_` 物理前缀，并以只面向全新数据库的单一迁移重置早期历史。
- [ADR-0027](ADR-0027-system-and-business-module-classification.md)：前后端模块按 `system` 与 `biz` 分类，公共契约路径保持稳定。
- [ADR-0028](ADR-0028-product-and-creator-brand-separation.md)：使用 CYBER 作为产品品牌，并把 JTLab 限定为明确、独立的创作者署名。
- [ADR-0029](ADR-0029-frontend-runtime-localization.md)：使用独立前端模块提供运行时中英文切换，以模块资源和严格默认菜单指纹保护用户录入数据。
- [ADR-0030](ADR-0030-repository-native-documentation-archive-review.md)：使用仓库原生审计命令和活动计划作为跨 AI 的文档重建与归档审查协议。
- [ADR-0031](ADR-0031-cyber-ai-forge-brand.md)：将正式产品名更新为 Cyber AI Forge，并同步项目级认证与浏览器存储标识。

新增 ADR 时使用 [ADR 模板](../templates/adr-template.md)和下一个连续编号。ADR 被取代或被后续基线吸收后更新替代关系并移入 `docs/archive/decisions/`，编号不得复用。
