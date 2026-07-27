# 项目文档入口

`docs/` 的当前区只保存完成任务所需的现行事实；历史设计、已取代 ADR、完成计划和完成日志集中在 `archive/`，默认不读取。

## AI 最小阅读协议

每次任务按以下顺序建立上下文：

1. 阅读本文件。
2. 检查 [进行中的计划](plans/README.md)，避免重复实施。
3. 从[设计索引](design/README.md)选择与改动直接相关的文档；不要遍历全部设计。
4. 只有需要理解长期取舍时，才从[现行 ADR 索引](decisions/README.md)选择相关记录。
5. 错误码、人工操作和模板分别按需查询 `reference/`、`guides/`、`templates/`。

跨模块、新模块或架构任务应额外阅读[系统概览](design/system-overview.md)和[模块边界](design/module-boundaries.md)。局部修复只读所属模块设计和直接相关 ADR。

禁止为“先熟悉项目”而递归读取整个 `docs/`。`docs/archive/**` 不属于默认上下文；只有用户要求历史、排查回归/兼容性、当前文档明确引用历史证据，或准备恢复旧方案时，才先从[归档索引](archive/README.md)定位一至两份文件。

## 当前目录

```text
docs/
├── design/          # 当前系统与模块设计
├── decisions/       # 仍有效的 ADR
├── plans/active/    # 正在执行的计划
├── ai-logs/         # 正在执行任务的协作记录
├── guides/          # 人类操作指南，按需阅读
├── reference/       # 当前参考表，按需查询
├── templates/       # 文档模板
└── archive/         # 历史证据，默认不读取
```

## 生命周期

| 类型 | 当前区 | 进入归档的条件 |
| --- | --- | --- |
| Design | `design/` | 被合并、废弃或大幅重写 |
| ADR | `decisions/` | 被后续 ADR 取代 |
| Plan | `plans/active/` | 完成、取消或被取代 |
| AI Log | `ai-logs/YYYY/MM/` | 对应任务结束 |

当前设计始终描述“现在怎样工作”。当前 ADR 只解释仍有效的长期取舍。计划和日志不复制正式结论，任务结束后与历史过程一起归档。详细规则见[分层文档与历史归档](design/documentation-governance.md)。

## 强制规则与命名

根目录 [AGENTS.md](../AGENTS.md) 定义 Git 暂存区门禁、文档门禁、归档步骤和 AI 提交标记。

- 设计：稳定英文小写名称，如 `backend.md`。
- 计划和日志：`YYYY-MM-DD-<topic>.md`。
- ADR：`ADR-NNNN-<topic>.md`，编号递增且不复用。
- 正文默认中文，代码标识保持原样。
