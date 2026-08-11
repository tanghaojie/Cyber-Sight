---
title: Cyber AI Forge 上游归档审查
date: 2026-08-11
status: active
---

# Cyber AI Forge 上游归档审查

## 用户目标和约束

用户要求把 Forge 最新修改合并到 Cyber-Sight，冲突由用户处理，最后直接合并到本地 `master` 并推送 `origin/master`，不创建 PR。

## 关键状态

- 合并前 `master` 与 `origin/master` 均为 `3145522`，工作区和暂存区为空。
- `upstream/master` 更新到 `40ab229`，包含前端品牌配置收敛、文案大小写、环境变量清理和归档审查关闭。
- 已在 `sync/forge-2026-08-11-2` 开始非快进合并；用户已解决全部 Git 冲突。
- 归档门禁发现一条文档断链和架构变化，已创建同范围活动归档审查计划。

## 重要假设

- Cyber-Sight 的 `SIGHT`、`Cyber Sight`、多域智能平台 tagline、GitHub URL 和 7777/7000 端口是维护者本轮选择的下游事实，不能被上游默认值覆盖。
- Forge 删除根目录未使用的 `.env.example` 是已完成的上游意图，合并结果保留该删除。
- `VITE_APP_GITHUB_URL` 仍是 Cyber-Sight 支持的覆盖项，因此 README 必须继续登记。

## 当前改动和未决事项

已补正 README 环境变量清单和现行 ADR 索引；待运行完整验证、完成归档审查、创建合并提交、快进本地 `master` 并推送 `origin/master`。

## 相关计划

- [上游归档审查计划](../../../plans/active/2026-08-11-cyber-sight-upstream-archive-review.md)
- [上游同步设计](../../../design/upstream-synchronization.md)
