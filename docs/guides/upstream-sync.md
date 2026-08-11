# Cyber AI Forge 上游同步指南

## 1. 这套流程解决什么问题

Cyber-Sight 是独立产品仓库，但保留与 Cyber AI Forge 的共同 Git 历史。日常开发只向 Cyber-Sight 推送；需要脚手架的新能力或修复时，再从 `upstream` 获取并显式合并。

```text
Cyber AI Forge                       Cyber-Sight
upstream/master -- fetch + merge --> sync/forge-YYYY-MM-DD
                                          |
                                          v
origin/master <---------------------- 验证后交付
```

这不是镜像同步。Cyber-Sight 的业务、README 和产品品牌不会被上游自动覆盖。

## 2. 首次 clone 后配置安全边界

在 Cyber-Sight 仓库根目录执行：

```powershell
git remote -v
git branch --set-upstream-to=origin/master master
git config remote.pushDefault origin
git config branch.master.pushRemote origin
git config pull.ff only
git config fetch.prune true
git remote set-url --push upstream DISABLED
```

如果 clone 中还没有 `upstream`，先添加 fetch URL，再禁用 push：

```powershell
git remote add upstream https://github.com/tanghaojie/Cyber-AI-Forge.git
git remote set-url --push upstream DISABLED
```

验证结果：

```powershell
git remote -v
git branch -vv
git config --local --get remote.pushDefault
git config --local --get branch.master.pushRemote
git config --local --get pull.ff
git config --local --get fetch.prune
```

预期 `origin` fetch/push 都指向 Cyber-Sight；`upstream` fetch 指向 Cyber AI Forge，push 显示 `DISABLED`；`master` 跟踪 `origin/master`。

## 3. 同步前检查

同步必须作为独立任务执行，不能夹带尚未提交的业务改动：

```powershell
git status --short
git diff --cached --quiet
git fetch origin --prune
git fetch upstream --prune
git switch master
git pull --ff-only origin master
```

`git status --short` 必须没有输出。暂存区或工作区有内容时，先完成当前任务；不要 stash、取消暂存或覆盖无法确认归属的修改来绕过检查。

## 4. 检查并合并更新

建立带日期的同步分支：

```powershell
git switch -c sync/forge-YYYY-MM-DD
git log --left-right --cherry-pick --oneline master...upstream/master
git diff --stat master...upstream/master
git merge --no-ff upstream/master -m "chore: sync Cyber AI Forge @ <upstream-sha>"
```

不要执行：

- `git pull upstream master`：它会在获取后立即合并，减少检查机会。
- `git push upstream ...`：Cyber-Sight 不向脚手架仓库直接推送。
- `--allow-unrelated-histories`：两个仓库已有共同历史；再次需要该参数通常表示远端或初始化错误。
- `git push --force`、对已发布 `master` rebase、把整批上游提交 squash 或 cherry-pick。

## 5. 冲突怎么处理

### 保留 Cyber-Sight，再人工吸收上游内容

- `README.md`、`README.en.md`。
- Cyber-Sight 产品品牌、公开 URL、推广站内容和 SEO。
- `src/modules/biz/**` 及产品业务设计。
- `docs/design/upstream-synchronization.md` 和本指南。

### 优先理解上游变化

- 未定制的 `src/modules/system/**`。
- 通用脚本、基础测试和共享构建能力。
- `cyber-ai-forge`、`@cyber-ai-forge/*`、JWT 与浏览器存储兼容标识。

### 逐项判断，禁止机械选择

- `AGENTS.md`、根脚本、锁文件和包配置。
- API 契约、应用组装、数据库 Schema 与迁移。
- 当前 Design、ADR 和文档归档台账。

如果一个修复对 Cyber AI Forge 也有价值，优先在上游形成提交，然后重新同步，不要在两个仓库复制实现。

## 6. 验证和交付

常规完整验证：

```powershell
pnpm format
pnpm format:check
pnpm lint
pnpm test
pnpm build
pnpm docs:archive:check:ci
```

数据库变化还需执行适用迁移和 `pnpm test:db`。前端页面、交互和浏览器行为由维护者人工验收。

验证通过后可以：

```powershell
git switch master
git merge --ff-only sync/forge-YYYY-MM-DD
git push origin master
```

需要 GitHub 审查时，也可以推送同步分支并创建 PR。同步说明应记录上游 SHA、冲突处理、自动验证和待完成人工验收。

## 7. 远端保护

本地无效 push URL 是第一层保护。Cyber AI Forge 的 GitHub 默认分支还应启用服务端规则，至少阻止 force push，并根据维护方式要求 PR 或状态检查；管理员不应默认绕过关键规则。远端规则由维护者在 GitHub 设置中单独确认。

长期设计与 AI 约束见[上游同步设计](../design/upstream-synchronization.md)和根目录 [AGENTS.md](../../AGENTS.md)。
