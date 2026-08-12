---
title: 源码路径、格式化与管理页面组件化
date: 2026-07-28
status: completed
---

# 源码路径、格式化与管理页面组件化

## 用户目标和约束

- 把需要返回上级目录的文件导入迁移为以 `@` 开始的 `src` 别名，向下级导入保留 `./`。
- 读取维护者 VS Code 格式偏好，让 AI 和 Git 提交自动遵守。
- 按 `pages/components/` 习惯拆分前端大 Page 为列表与新增/编辑 Dialog，Page 只作聚合入口。

## 关键问答与确认

无需额外确认；VS Code 配置明确给出 Prettier 的无分号、单引号和行宽 100。读取时发现个人配置
包含敏感凭据，该内容不记录、不复制、不写入仓库，并已提醒维护者轮换。

## AI 的重要假设

- “很多模块 Page”指符合列表 + 新增/编辑 Dialog 形态的 users、roles、menus、dictionaries；
  登录页和工作台不是本轮拆分对象。
- `@` 在每个 workspace 内分别指向其自身 `src`，不替代 workspace package 名称。
- 自动格式化以 staged-only pre-commit 为安全边界，同时保留显式检查命令。

## 方案和执行摘要

已通过 Git 暂存区门禁并按最小阅读协议审计现行设计。三个 TypeScript workspace 均登记
`@` -> 本 workspace `src`；前端由 Vite/Vitest 解析，后端与契约包由 `tsc-alias` 改写产物。
项目新增 Prettier、VS Code format-on-save、lint-staged 和 simple-git-hooks，并完成一次格式
基线整理。四个管理页面已拆成列表与 Dialog，Page 只协调打开目标和保存后的刷新。

## 验证结果

- `pnpm format:check` 通过。
- `pnpm test` 通过：前端 42 项、后端 63 项，共 105 项。
- `pnpm build` 通过；后端与契约构建产物无 `@/` 残留。
- 源码搜索只剩运行时迁移文件 URL 与刻意构造的非法路径测试数据使用 `../`。
- pre-commit hook 已安装并调用可成功执行的 `pnpm lint-staged`。
- users、roles、menus、dictionaries Page 分别缩至 51、36、46、37 行。

## 未决问题与下一步

无阻塞。`rtk` 在当前环境不可用，已使用原生命令完成。Vite/VueUse/Sass 输出现有上游弃用
警告，未影响测试或构建，本轮未扩大范围升级依赖。

## 相关设计、ADR、计划和提交

- `docs/design/developer-workflow.md`
- `docs/decisions/ADR-0021-source-alias-and-automated-formatting.md`
- `docs/archive/plans/2026-07-28-source-format-and-page-components.md`
- 关联提交：包含本协作记录归档的交付提交。
