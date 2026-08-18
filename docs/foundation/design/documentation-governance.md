---
title: 分层文档与历史归档
scope: foundation
repository: Cyber-AI-Forge
status: accepted
owner: project maintainers
updated: 2026-08-18
---

# 分层文档与历史归档

## 目标

让人和 AI 先获得完成当前任务所需的最小、现行上下文，同时保留可按需追溯的决策、计划和协作证据。文档分为“当前事实”和“历史证据”，禁止把归档内容当作默认阅读集。

## 当前事实的优先级

发生冲突时按以下顺序处理：

1. 人类维护者对当前任务的明确指令和确认。
2. 人类写入或确认的当前代码、配置、契约和测试。
3. 与当前实现一致的现行设计、ADR、指南和参考表。
4. 计划、AI 协作记录、历史 ADR、归档设计和聊天推断。

AI 不得用低优先级来源覆盖高优先级内容。用户已经要求同步文档时，可以修正含义明确的失配；发现 bug、风险、意图不明或任务范围外的文档失配时，必须说明证据和影响并询问维护者下一步。完整规则见根目录 `AGENTS.md`。

## 目录与职责

```text
docs/
├── README.md              # 最小阅读入口与任务路由
├── design/                # 当前有效的系统和模块设计
├── decisions/             # 当前有效的 ADR
├── plans/active/          # 正在执行的计划
├── ai-logs/               # 正在执行任务的结构化协作记录
├── guides/                # 人类操作指南，按需阅读
├── reference/             # 当前参考表，按需查询
├── templates/             # 新文档模板
└── archive/               # 历史证据；默认不读取
    ├── design/
    ├── decisions/
    ├── plans/
    └── ai-logs/
```

`design/` 回答“现在怎样工作”，`decisions/` 回答“现行长期约束为何成立”。计划和 AI 日志只在任务进行期间留在当前区；完成、取消或被取代后进入 `archive/`。归档不再作为现行规范维护，但必须保留原始状态、替代关系和可追溯路径。

## 最小阅读协议

每次任务先读 `docs/README.md` 并检查 `docs/plans/active/`。随后只按任务关键词从 `design/README.md` 和 `decisions/README.md` 选择直接相关文档；禁止递归读取整个 `docs/`。

默认不读 `docs/archive/**`、完成的 AI 日志、模板和面向人类的指南。只有以下情况才进入归档：

- 用户明确要求历史、原因、迁移或旧行为；
- 当前设计或 ADR 明确要求查阅某份历史证据；
- 排查回归、兼容性或决策冲突，且当前文档不足以解释；
- 准备恢复被废弃的方案。

进入归档时先读 `docs/archive/README.md`，再打开其中一至两份最相关文件，不做无目标的全量扫描。

## 生命周期

- Design：原地维护当前事实；被合并、废弃或大幅重写的旧版本移入 `archive/design/`。
- ADR：已接受且仍有效的记录留在 `decisions/`；被取代、被初始版本基线吸收或失去现行解释价值后移入 `archive/decisions/`。既有旧格式编号保持稳定；新增 ADR 使用日期命名。
- Plan：任务期间位于 `plans/active/`；结束后标记最终状态并移入 `archive/plans/`。
- AI Log：任务期间位于 `ai-logs/YYYY/MM/`；随任务结束移入 `archive/ai-logs/YYYY/MM/`。
- Guide、Reference、Template：只保留当前可用版本；纯历史版本按内容类型进入归档。

归档迁移必须同步更新当前索引和相对链接。当前文档优先链接现行设计或 ADR；历史计划和日志集中从归档索引查找，避免在每份当前模块设计中重复罗列。

## 文件命名

- 新增 ADR 使用 `ADR-YYYYMMDD-<topic>.md`，其中日期使用创建/接受日期，`<topic>` 使用简短、稳定的小写 kebab-case slug。
- ADR 文件名中的日期必须与 frontmatter 的 `date: YYYY-MM-DD` 对应；日期和 topic 在 ADR 创建后保持不变。
- 同一天创建多个 ADR 时通过唯一 topic 区分，不分配顺序号，也不通过顺序号解决并发冲突。
- 既有 `ADR-NNNN-<topic>.md` 文件作为历史兼容格式保留，不批量重命名；既有引用继续保持原样。
- 新增文档引用新 ADR 时使用其日期命名路径。计划和 AI 日志继续使用各自的日期命名规则。
- 归档审计同时识别旧格式和新格式，以免历史 ADR 从治理统计中消失。
- 本规则由 [ADR-20260811](../decisions/ADR-20260811-adr-filename-convention.md) 正式记录。

## 压缩规则

- 一个事实只保留一个当前权威来源，其他文档用链接和一句话摘要引用。
- 当前设计保留边界、接口、数据流、失败模式和测试策略；实施过程、逐次偏差和已完成清单进入归档。
- ADR 保留决策背景、选择、影响和复审条件，不复制完整实现说明。
- 索引只路由现行文档，不展开历史文件清单。
- 可由代码、测试或 Git 直接恢复的逐文件过程不复制到当前文档。

## 验证

文档结构调整后至少验证：当前索引无归档项混入、Markdown 相对链接存在、ADR 状态与所在目录一致、`plans/active/` 只含进行中计划，以及默认阅读集的文件数和行数没有反向增长。

2026-08-11 已完成日期命名规则落地：既有 ADR 文件名和引用保持不变，新增 ADR 使用日期命名，归档审计兼容新旧两种格式。`pnpm format`、`pnpm format:check`、`pnpm docs:archive:check` 和 `pnpm docs:archive:check:ci` 均通过；本次没有发现偏差或遗留问题，关联提交为本任务提交。

## 初始版本基线

2026-07-29 之前的设计取舍已经进入初始版本代码和现行设计，原 ADR 作为形成过程归档。当前区只保留初始版本之后仍需要解释的长期决策。详见 [ADR-0024](../decisions/ADR-0024-human-authored-state-authority.md)。

## 自动文档重建与归档审查

### 目标

项目允许多个不同的 AI 智能体协作。归档触发不能依赖 `.codex`、`.claude` 或其他平台私有目录；同时，
人类提交通常只包含代码和配置，AI 需要从实现证据中补充当前 Design、文档和 ADR。

### 共享协议、仓库角色与所有权状态

- AI 任务按范围触发归档审计：只读问答、代码浏览、格式化、注释和单文件机械改动可以跳过；涉及业务行为、API、数据模型、模块边界、架构、迁移、ADR、计划或文档治理的任务，在首次修改文件前运行 `pnpm docs:archive:check`。
- 如果任务范围中途扩大，必须在修改相关文件前补运行归档审计。
- `scripts/docs/archive-audit.mjs` 与 `docs/foundation/archive/archive-policy.json` 是由 Foundation 维护并同步的共享协议。脚本只读计算 Git 提交、当前文档、活动计划和归档基线，不启动 AI，也不写工作区。
- 根 `.archive-audit.json` 是当前仓库自己的审计角色配置，声明 `managedScopes`、`inheritedScopes`、`excludedScopes` 和 `integrationOwner`。同步将该文件作为 Platform 内容保留，不从仓库名称、Git remote 或 AI 私有状态推断角色。
- `docs/<scope>/archive/archive-ledger.json` 由对应所有权作用域维护，只记录该作用域最近一次完成审查的 Git 基线。Foundation ledger 可同步但在下游只读；Platform 下游只推进 Platform ledger。
- 需要处理的任务使用对应 `docs/<scope>/plans/active/` 下带有 `type: documentation-archive-review` 的普通计划表示。计划默认覆盖 frontmatter 的 `scope`，跨作用域计划通过逗号分隔的 `review_scopes` 显式声明。
- 归档完成后，计划进入同作用域 `archive/plans/`，并更新同作用域 ledger 与索引。
- 合并前或 CI 使用 `pnpm docs:archive:check:ci`；没有 CI 的任务在最终验证阶段运行同一入口。只要 managed scope 仍然 `due: true`，即使已有活动计划，CI 也继续失败，直到审查完成并推进 ledger。

Forge 上游角色管理 `foundation`、`forge` 与默认 `platform`。业务平台下游角色只管理 `platform`，把 `foundation` 标记为 inherited 并排除 `forge`。Integration 路径由 Foundation 负责；下游不得把 Integration 变更吸收到 Platform 归档任务。

### 审查单元与证据归属

第一版以文档所有权作用域作为 review unit，不建立模块级 ledger：

- `ownerScope`：`foundation | forge | platform | integration`，由 `.forge-sync.yml` 路径分类决定；Integration 再映射到仓库配置声明的责任方。
- `component`：`frontend | backend | api-contract | tooling`，只作为报告证据。
- `module`：模块目录中的稳定模块名，只作为报告证据。
- ADR、计划、失效 ADR 和断链按其源文档所在的 `docs/<scope>/` 归属；根 `docs/README.md` 等 Integration 文档归 `integrationOwner`。

Managed scope 计算提交、ADR、完成计划、时间阈值和立即触发条件。Inherited scope 不计算本地周期阈值，只检查断链和仍留在当前区的失效 ADR；发现问题返回 `UPSTREAM_REQUIRED`，要求先在 Forge 修复后同步。Excluded scope 不参加当前仓库审计。

### 默认触发条件

任一 managed ownership scope 达到以下条件时生成归档审查候选：

- 同一范围内达到 20 个有效代码提交；
- 3 个新增且仍为 `accepted` 的 ADR；
- 3 个完成的功能计划；
- 距离上次审查超过 30 天。

共享架构边界或归档治理文件变更、当前文档链接失效或仍在当前区保存 `superseded`/`replaced`/`retired` ADR 时立即触发。跨所有权提交只触发实际涉及且由当前仓库管理的作用域，不生成全局单一任务。
格式化、纯文档、合并、生成产物和锁文件提交不计入有效代码提交。

### AI 审查顺序

1. 检查暂存区和工作区，避免覆盖人类未提交内容。
2. 只处理报告中由当前仓库管理的 ownership scope；下游的 inherited Foundation 问题转回 Forge。
3. 阅读该 scope 基线之后的人类提交、代码差异、测试、API 契约和数据库迁移。
4. 依据可验证事实更新该 scope 当前 Design 和 ADR。
5. 判断旧文档是否保留、更新、合并或归档，并建立替代关系。
6. 更新当前索引后，归档被取代的 Design、文档、ADR、完成计划和 AI 协作记录。
7. 执行格式、链接和项目约定的验证，记录实际偏差和未决问题，再推进该 scope ledger。

代码、测试、契约和 Git diff 可以证明当前行为；提交信息可能提供设计原因。无法从仓库证据确认的意图
必须标记为待维护者确认，不能由 AI 编造后写入当前 ADR。

### 任务状态

审计结果使用以下状态：

- `NOT_DUE`：managed scope 尚未达到条件；
- `DUE`：managed scope 应在自己的活动计划目录创建归档审查计划；
- `IN_PROGRESS`：同一 scope 已有匹配的归档审查计划，应继续原任务，但 `due` 仍为 `true`，CI 不放行；
- `INHERITED`：只读同步作用域没有结构性问题，不参与本地周期阈值；
- `UPSTREAM_REQUIRED`：只读同步作用域存在断链或失效 ADR，必须回上游修复；
- `EXCLUDED`：当前仓库不包含或不管理该作用域；
- `BLOCKED`：配置、基线或证据存在需要人类确认的冲突。

顶层状态按 `BLOCKED`、`DUE`、`UPSTREAM_REQUIRED`、`IN_PROGRESS`、`NOT_DUE` 的顺序聚合，但报告必须始终保留每个作用域的独立状态、原因、证据和匹配计划。一个作用域的活动计划不能覆盖另一个作用域的 `DUE`。

### 兼容性与迁移

旧版 `version: 1` repository ledger 只作为一次性迁移输入。切换 v2 时，Forge 必须对 Foundation、Forge 和默认 Platform 分别确认旧基线至实现提交之间的证据，再写入各自 `version: 2` ledger。下游业务仓库单独建立自己的 Platform 基线，不复制 Forge 的 Foundation 完成状态。完成迁移后，脚本缺少角色配置或对应 managed ledger 时返回 `BLOCKED`，不静默回退到全仓库任务。

本设计由 [ADR-20260818](../decisions/ADR-20260818-scope-owned-documentation-archive-audit.md)记录，取代 ADR-0033 中单一 Foundation ledger 和全局活动计划的状态模型；按任务范围决定何时启动检查的原则继续保留。
