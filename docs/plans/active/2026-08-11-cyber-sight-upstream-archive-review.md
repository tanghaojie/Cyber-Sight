---
title: Cyber AI Forge 上游归档审查
type: documentation-archive-review
status: active
created: 2026-08-11
updated: 2026-08-11
scope: repository
baseline_commit: 314552225362e7343779ef121b6893a502990a9f
---

# Cyber AI Forge 上游归档审查

## 目标

审查 Cyber AI Forge 最新同步提交 `40ab229` 及其前置提交，修复同步冲突产生的文档断链，并确认上游品牌配置收敛、前端行为修复和归档台账与 Cyber-Sight 当前事实一致。

## 触发原因与范围

`pnpm docs:archive:check:ci` 在合并前返回 `DUE`，原因是检测到架构变化和一条断链。审查范围包括当前合并分支、README 配置说明、现行 ADR/Design、归档索引、归档台账及上游新增的前端品牌配置文档。

## 当前处理

- 已确认工作区初始干净，并在 `sync/forge-2026-08-11-2` 上合并 `upstream/master`。
- 已由维护者解决冲突，保留 Cyber-Sight 产品品牌、仓库 URL、端口和下游配置，同时吸收 Forge 的 `VITE_APP_TAGLINE` 配置收敛、动态标题和 Logo 展示逻辑。
- 已补回 README 中仍受支持的 `VITE_APP_GITHUB_URL`，并移除现行索引中指向已归档 ADR-0031 的失效链接。

## 待完成任务

- [ ] 检查当前代码、Design、ADR、README、归档索引和相对链接。
- [ ] 运行格式、Lint、测试、构建和文档归档 CI。
- [ ] 记录上游提交、冲突处理、验证结果和人工验收边界。
- [ ] 完成审查计划与 AI 记录并移入归档目录。

## 非目标

- 不把 Cyber-Sight 的产品品牌改回 Cyber AI Forge。
- 不向 `upstream` 推送，不创建 PR。
- 不新增前端自动化或浏览器测试。

## 相关文件

- [上游同步设计](../../design/upstream-synchronization.md)
- [上游同步指南](../../guides/upstream-sync.md)
- [AI 协作记录](../../ai-logs/2026/08/2026-08-11-cyber-sight-upstream-archive-review.md)
