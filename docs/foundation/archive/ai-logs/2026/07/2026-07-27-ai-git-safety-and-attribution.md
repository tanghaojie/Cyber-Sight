---
title: AI Git 暂存区门禁与提交署名
date: 2026-07-27
status: completed
---

# AI Git 暂存区门禁与提交署名

## 用户目标和约束

用户要求增加仓库级强约束：每次 AI 写代码前必须确认当前 Git 暂存区为空；如果已有暂存内容，必须要求人类先提交，AI 才能开始工作。AI 自动提交必须追加 `Co-Authored-By: -AI- [AI model name] <ai@scaffold-proj.com>`，其中模型占位符必须替换为真实模型名称。

## 关键问答与确认

本轮无需额外确认。规则按硬门禁处理，不允许 AI 代替人类提交既有暂存内容、取消暂存或绕过检查。

## AI 的重要假设

- “当前 Git 没有暂存内容”以当前仓库索引相对 `HEAD` 无差异为准，使用 `git diff --cached --quiet` 检查。
- 门禁检查发生在 AI 首次修改仓库文件之前；AI 完成本轮改动后可以暂存自身改动以创建最终提交。
- 当前执行模型的真实名称为 `GPT-5`，本轮提交 trailer 将使用该名称。
- 该约束属于 AI 协作治理，不新增架构 ADR，也不引入无法可靠区分人类与 AI 提交的 Git hook。

## 方案和执行摘要

- 任务开始时检查 Git 暂存区和工作区，二者均为空。
- 创建实施计划和本协作日志。
- 更新 `AGENTS.md`，将暂存区检查置于所有文档阅读和实施步骤之前，并规定门禁失败时立即停工、由人类先提交。
- 规定所有 AI 提交必须追加真实模型名称 trailer，并在提交后读取最新提交消息验证。
- 同步更新文档治理设计、文档入口和相关索引，完成计划归档。

## 验证结果

- `git diff --cached --quiet` 在首次修改前和实施期间均成功。
- `git diff --check` 通过，仅出现仓库既有换行符转换提示。
- 关键规则搜索确认检查命令、停工行为、禁止绕过、trailer 格式和提交后验证均已写入正式规则。
- 变更范围仅包含治理文档，没有修改业务源码。
- 最终提交创建后使用 `git log -1 --format=full` 验证 `Co-Authored-By: -AI- GPT-5 <ai@scaffold-proj.com>`。

## 未决问题与下一步

没有未决问题。

## 相关设计、ADR、计划和提交

- `docs/design/documentation-governance.md`
- `docs/archive/plans/2026-07-27-ai-git-safety-and-attribution.md`
- 提交：本轮 AI Git 安全门禁与署名规则提交
