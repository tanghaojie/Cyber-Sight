---
title: ADR 日期命名规则
status: completed
created: 2026-08-11
updated: 2026-08-11
---

# ADR 日期命名规则

## 目标

将新增 ADR 的文件名从顺序号改为日期与主题组合，降低多人并行创建 ADR 时的编号冲突和理解成本，同时保留既有 ADR 的路径与历史引用。

## 背景与设计依据

当前规则使用 `ADR-NNNN-<topic>.md`。计划和 AI 日志已经使用日期命名；用户确认新增 ADR 改用 `ADR-YYYYMMDD-<topic>.md`，既有 ADR 文件名及引用不变。

依据：

- [分层文档与历史归档](../../design/documentation-governance.md)
- [当前文档入口](../../README.md)
- [现行 ADR 索引](../../decisions/README.md)

## 范围

- 更新当前 ADR 命名规则、设计治理说明和 ADR 模板。
- 新增一份采用新规则的 ADR，正式记录长期命名决策。
- 调整归档审计，使其同时识别旧格式和新格式。
- 保持 39 个既有 ADR 文件名、正文中的旧标识和既有引用不变。

## 非目标

- 不重命名当前或归档 ADR。
- 不批量修改历史计划、AI 日志、设计快照或归档索引中的旧 ADR 引用。
- 不改变 ADR 的状态、内容或归档生命周期。

## 前置条件和风险

- 新文件名日期取 ADR frontmatter 的创建/接受日期。
- 同日 topic 必须唯一；校验脚本只负责识别格式，不自动分配 topic。
- 新规则改变后，外部工具仍可能只识别旧的四位顺序号，需要以仓库脚本和模板为准。

## 实施任务

- [x] 确认新增 ADR 使用日期命名，既有 ADR 保持不变。
- [x] 更新设计治理说明、入口、索引和模板。
- [x] 新增日期命名 ADR。
- [x] 让归档审计兼容旧格式和新格式。
- [x] 执行格式、链接和归档 CI 校验。

## 测试与验证

- `pnpm format`
- `pnpm format:check`
- `pnpm docs:archive:check`
- `pnpm docs:archive:check:ci`
- 检查 Markdown 相对链接、ADR 文件名格式和既有 ADR 路径未被修改。

## 发布与回滚

本次只修改文档和文档审计规则。若验证失败，修复后再提交；若需回滚，按提交粒度恢复本次新增规则、设计、计划和日志，不触碰既有 ADR 历史文件。

## 实际偏差和遗留问题

无。按用户确认保留了所有既有 ADR 文件名和引用，因此仓库中暂时并存旧格式和新格式；归档审计已兼容两者。

实际验证结果：

- `pnpm format`：通过。
- `pnpm format:check`：通过。
- `pnpm docs:archive:check`：通过，状态为 `NOT_DUE`。
- `pnpm docs:archive:check:ci`：通过，状态为 `NOT_DUE`。
- ADR 文件名检查：40 个 ADR 文件全部匹配兼容格式，其中 39 个为旧格式、1 个为新格式。

## 相关设计、ADR 和 AI 日志

- [分层文档与历史归档](../../design/documentation-governance.md)
- [ADR 日期命名规则](../../decisions/ADR-20260811-adr-filename-convention.md)
- [AI 协作记录](../../archive/ai-logs/2026/08/2026-08-11-adr-filename-convention.md)

关联提交：本任务提交。
