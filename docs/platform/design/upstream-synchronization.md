---
title: Cyber AI Forge 上游同步
status: accepted
owner: project maintainers
updated: 2026-08-14
---

# Cyber AI Forge 上游同步

## 目标与仓库关系

Cyber-Sight 是以 Cyber AI Forge 为工程基线、长期独立演进的下游产品仓库，不是 GitHub fork network 中的 fork。两个仓库保留共同 Git 历史，通过本地双远端持续吸收脚手架更新：

- `origin`：`https://github.com/tanghaojie/Cyber-Sight.git`，Cyber-Sight 唯一日常推送目标。
- `upstream`：`https://github.com/tanghaojie/Cyber-AI-Forge.git`，只获取脚手架更新，禁止从本仓库直接推送。
- 本地 `master` 跟踪 `origin/master`；无参数 `git push` 默认使用 `origin`。

同步目标是保留 Cyber AI Forge 的提交身份和共同祖先，同时让 Cyber-Sight 的业务、产品品牌和文档保持独立。同步不是镜像复制，不允许用上游内容覆盖整个下游仓库。

## 文件所有权

### Cyber-Sight 下游拥有

- `README.md` 与 Cyber-Sight 产品入口。
- 产品可见品牌配置、浏览器元信息、Swagger 展示和产品文档内容。
- `apps/frontend/src/platform/**`、`apps/backend/src/platform/**`、`packages/api-contract/src/platform/**` 和 `apps/backend/drizzle/platform/**` 中的产品业务能力及其设计、契约和迁移。
- 本设计、上游同步指南及 Cyber-Sight 专属 ADR。

同步冲突涉及这些文件时，保留 Cyber-Sight 当前产品身份，再人工移植上游真正适用的工程说明或修复。

### Cyber AI Forge 上游拥有

- 未被 Cyber-Sight 实质定制的 `apps/frontend/src/foundation/**`、`apps/backend/src/foundation/**` 和 `packages/api-contract/src/foundation/**` 系统能力。
- 共享构建基础、通用脚本、基础测试和脚手架通用文档规则。
- `cyber-ai-forge` 根包名、`@cyber-ai-forge/*` workspace 作用域及现有 JWT、浏览器存储技术标识。

通用缺陷和可复用增强应优先进入 Cyber AI Forge，再通过上游同步进入 Cyber-Sight，避免在两个仓库维护语义相同但提交身份不同的补丁。

### 必须逐项审查

`AGENTS.md`、根脚本、锁文件、数据库迁移、共享契约、应用组装点和现行 Design/ADR 同时影响脚手架与产品。同步时不得机械选择 ours/theirs；必须根据当前代码、测试和 Cyber-Sight 的长期决定逐项合并。

## 本地安全配置

每个 Cyber-Sight clone 应使用以下仓库级配置：

```powershell
git branch --set-upstream-to=origin/master master
git config remote.pushDefault origin
git config branch.master.pushRemote origin
git config pull.ff only
git config fetch.prune true
git remote set-url --push upstream DISABLED
```

`DISABLED` 是故意无效的 push 目标。`git remote -v` 应显示 `upstream` fetch 指向 Cyber AI Forge、push 指向 `DISABLED`。GitHub 端仍应保护 Cyber AI Forge 的默认分支，并让规则覆盖管理员；服务端规则不由本地配置替代。

## 获取和合并上游更新

同步前保持工作区和暂存区为空，并从最新 Cyber-Sight 默认分支建立专用同步分支：

```powershell
git status --short
git diff --cached --quiet
git fetch origin --prune
git fetch upstream --prune
git switch master
git pull --ff-only origin master
git switch -c sync/forge-YYYY-MM-DD
git log --left-right --cherry-pick --oneline master...upstream/master
git merge --no-ff upstream/master -m "chore: sync Cyber AI Forge @ <upstream-sha>"
```

发生冲突时按“文件所有权”处理，并在合并提交中保留 `upstream/master` 作为第二父提交。禁止用 squash、批量 cherry-pick 或对已发布 `master` rebase 来伪造同步；禁止再次使用 `--allow-unrelated-histories`。若 Git 报告历史无关，应停止并检查远端或仓库初始化错误。

## 验证与交付

合并完成后至少执行：

```powershell
pnpm format
pnpm format:check
pnpm lint
pnpm test
pnpm build
pnpm docs:archive:check:ci
```

数据库或迁移变化还要执行对应数据库验证。前端自动化边界不因同步而改变；浏览器功能和视觉由维护者人工验收。

验证通过后，可以把同步分支快进到本地 `master` 再推送，或推送同步分支后通过 PR 合并。无论采用哪种方式，合并说明必须记录上游提交 SHA、冲突处理、验证结果和未决人工验收。AI 创建的提交继续遵守根目录 trailer 规则。

## 失败模式与恢复

- 误推上游：本地无效 push URL 应先阻断；若服务端仍发生误推，停止后续操作并由维护者根据保护规则和远端历史决定恢复方式。
- 产品品牌被上游覆盖：恢复 Cyber-Sight 下游拥有的文件，再人工移植上游通用内容。
- 上游更新包含破坏性迁移：按独立非简单任务设计、验证和发布，不得把常规同步流程当作迁移批准。
- 验证失败：保留同步分支和证据，不推送 `master`，修复或向维护者报告具体阻塞。

## 相关决策与指南

- [Cyber-Sight 下游身份与上游兼容边界](../decisions/ADR-20260811-cyber-sight-downstream-identity.md)
- [人类维护者上游同步指南](../guides/upstream-sync.md)

## 2026-08-11 配置状态

当前 clone 已确认 `master` 跟踪 `origin/master`，默认推送远端和 `master` 的推送远端均为 `origin`，`pull.ff=only`、`fetch.prune=true`，且 `upstream` 的 push URL 为故意无效的 `DISABLED`。这些设置属于本地 `.git/config`，新 clone 仍须按本设计和人类指南重新配置；Cyber AI Forge 的 GitHub 服务端分支保护由维护者另行确认。
