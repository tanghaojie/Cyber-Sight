# 项目文档入口

仓库文档按所有权分为 Foundation 与 Platform 两个作用域，并保留公共模板。开始任务时先判断改动对象，再进入对应入口；不要把 Forge 上游工作、Foundation 共享基础和 Platform 业务工作混为同一任务。

## 作用域

- [Foundation](foundation/README.md)：Forge 维护并同步到业务平台的共享基础设施、现行规范和完整演进证据。
- [Platform](platform/README.md)：当前业务平台拥有的业务、品牌、配置、部署和历史。
- [公共模板](templates/)：由 Forge 维护并随 Foundation 同步，两个作用域共同使用。

## AI 最小阅读协议

1. 阅读本文件并判断 `scope: foundation | platform`。
2. 检查对应作用域的 `plans/active/`，避免重复实施。
3. 从对应 `design/README.md` 选择与改动直接相关的设计，不遍历全部文档。
4. 只有需要理解长期取舍时，再从对应 `decisions/README.md` 选择 ADR。
5. 只有排查回归、兼容性、历史原因或恢复旧方案时，才进入对应 `archive/`。

跨作用域任务必须声明主要作用域和受影响作用域。Foundation 任务在 Forge 仓库实施；业务平台不得在下游直接修改 `docs/foundation/**`，应先修正 Forge，再通过同步进入 Platform 仓库。

## 文档生命周期

每个作用域分别拥有 `design`、`decisions`、`plans`、`ai-logs` 和 `archive`。`docs/templates` 保持单一公共来源。详细治理规则见 [Foundation 文档治理设计](foundation/design/documentation-governance.md)。
