---
title: 源码路径、格式化与管理页面组件化
status: completed
created: 2026-07-28
updated: 2026-07-28
---

# 源码路径、格式化与管理页面组件化

## 目标

统一各 workspace 的源码导入和代码格式执行入口，并把四个管理页面拆成可读、职责明确的列表与
新增/编辑 Dialog 组件，使 Page 只保留页面级聚合。

## 背景与设计依据

依据 `developer-workflow.md`、`module-boundaries.md`、四个业务模块设计和 ADR-0021 实施。
维护者 VS Code 的有效 Prettier 偏好为无分号、单引号和行宽 100；个人配置中的其他设置和
敏感信息不进入仓库。

## 范围

- 为 frontend、backend、api-contract 配置 `@` -> 各自 `src`，迁移向上级模块导入。
- 固化 Prettier、VS Code format-on-save、格式命令和 staged-only pre-commit hook。
- 拆分 users、roles、menus、dictionaries 管理页面的列表与新增/编辑 Dialog。
- 更新对应设计、测试和工程文档。

## 非目标

- 不改变 HTTP 契约、业务规则、视觉设计或数据库结构。
- 不拆分不属于列表/Dialog 模式的登录页和工作台页。
- 不把运行时文件 URL、测试数据字符串或跨 package 包名改写为 `@`。

## 前置条件和风险

- 开始任务时 `git diff --cached --quiet` 已通过，工作区无既有修改。
- Node.js 不能直接执行 TypeScript `paths`，后端与契约包必须验证构建后别名改写。
- 组件拆分需要保持 loading、empty、error、分页、确认删除和保存刷新行为不变。

## 实施任务

- [x] 完成范围审计并建立设计、ADR、计划和 AI 协作记录。
- [x] 配置 workspace alias 并迁移向上级导入。
- [x] 固化格式配置、编辑器设置、命令和 pre-commit hook。
- [x] 拆分四个管理 Page 并更新相关测试夹具与断言。
- [x] 执行格式、测试、构建和产物检查。
- [x] 回写实际结果并归档计划/日志；交付提交包含本归档记录。

## 测试与验证

- `pnpm format:check` 通过。
- `pnpm test` 通过：前端 42 项、后端 63 项，共 105 项；契约包类型检查与别名改写通过。
- `pnpm build` 通过；前端 Vue 类型检查与 Vite 生产构建、后端和契约 TypeScript 构建均通过。
- 后端与契约 `dist` 搜索不到 `@/`；源码剩余 `../` 仅为迁移文件 URL 和刻意构造的非法路径
  测试数据。
- `.git/hooks/pre-commit` 已安装为 `pnpm lint-staged`，直接执行该项目脚本通过。
- Page 行数由 users 280、roles 251、menus 495、dictionaries 233 降至 51、36、46、37。

## 发布与回滚

不包含独立部署步骤。单一提交包含配置、重构与文档，可通过 Git 整体回滚；若只回滚别名配置，
必须同时回滚对应导入路径和构建脚本。

## 实际偏差和遗留问题

- `rtk` 在当前环境不可用，审计和验证改用原生命令完成。
- pnpm 全局 store 与沙箱本地 store 不同，依赖安装及 Vite/Vitest 验证经批准在沙箱外执行。
- 首次仓库级测试发现契约 `test` 的裸 `tsc` 会覆盖已改写产物，已改为 `tsc && tsc-alias`。
- 首次应用新 Prettier 配置时对受支持的现有文件执行了一次格式基线整理；构建产物、归档文档、
  lockfile 和 Drizzle 元数据已加入忽略范围或本就被忽略。
- Vite CJS Node API、VueUse PURE 注释和 Sass legacy JS API 仍输出上游弃用警告，但不影响测试和
  构建结果；本轮不升级相关依赖。

## 相关设计、ADR 和 AI 日志

- `docs/design/developer-workflow.md`
- `docs/design/modules/frontend.md`
- `docs/decisions/ADR-0021-source-alias-and-automated-formatting.md`
- `docs/archive/ai-logs/2026/07/2026-07-28-source-format-and-page-components.md`
