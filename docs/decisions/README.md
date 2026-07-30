# 现行架构决策索引

本目录只保留初始版本之后仍需要解释的长期决策。当前技术事实优先从[设计索引](../design/README.md)、共享契约、测试和代码读取；初始版本形成过程中的 ADR-0001 至 ADR-0023 已完整归档。

## 当前决策

- [ADR-0024](ADR-0024-human-authored-state-authority.md)：人类修改优先，初始版本实现与精简设计构成当前基线，发现冲突或问题时由人类决定下一步。
- [ADR-0025](ADR-0025-pluggable-authorization-and-data-scope.md)：默认使用本地可插拔授权 Provider，以稳定权限键和查询计划实现功能与数据权限。
- [ADR-0026](ADR-0026-system-table-prefix-and-fresh-baseline.md)：框架表统一使用 `sys_` 物理前缀，并以只面向全新数据库的单一迁移重置早期历史。
- [ADR-0027](ADR-0027-system-and-business-module-classification.md)：前后端模块按 `system` 与 `biz` 分类，公共契约路径保持稳定。

新增 ADR 时使用 [ADR 模板](../templates/adr-template.md)和下一个连续编号。ADR 被取代或被后续基线吸收后更新替代关系并移入 `docs/archive/decisions/`，编号不得复用。
