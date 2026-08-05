---
title: Personal profile editing
date: 2026-08-05
status: completed
---

# Personal profile editing

## 用户目标和约束

用户要求已登录后可点击头像，在下拉菜单打开个人资料修改页，修改姓名、邮箱和密码。仓库要求非简单变更先创建设计、计划和 AI 协作记录，并在完成后验证、归档和自动提交。

## 关键问答与确认

未提出需要用户确认的问题。采用当前用户自助更新，不要求管理员权限。

## AI 的重要假设

- 密码修改必须提交当前密码，且新密码继续遵守 8 至 128 个字符的既有约束。
- 修改密码后撤销该账户全部会话，包括当前会话，以防旧凭据继续可用。
- 姓名或邮箱更新后刷新当前会话身份快照，确保顶部头像和姓名立即反映结果。

## 方案和执行摘要

在 `users` 模块中增加个人资料读写接口和前端资料页；认证模块只提供既有密码校验、令牌缓存失效及会话撤销能力。个人资料页作为不依赖菜单的受保护静态路由，从 `AppHeader` 头像下拉菜单进入。

## 验证结果

`pnpm test` 通过：14 个测试文件、120 个测试。`pnpm build` 通过：共享契约、后端 TypeScript 与前端 `vue-tsc`/Vite 生产构建均成功。`pnpm format` 已执行；最终仍运行 `pnpm format:check`。前端浏览器操作留给维护者人工验收。

## 未决问题与下一步

无已知实现遗留问题。建议维护者以任意已登录账户验证：头像下拉可进入资料页，姓名/邮箱即时更新顶栏，错误当前密码被拒绝，成功改密后跳回登录页且旧会话失效。

## 相关设计、ADR、计划和提交

- `docs/design/modules/users.md`
- `docs/design/modules/auth.md`
- `docs/design/modules/frontend.md`
- `docs/archive/plans/2026-08-05-personal-profile.md`
- Git 提交：本轮完成后补充。
