---
title: 登录页与工作台首屏信息重设计
status: completed
type: frontend-visual-refresh
owner: maintainers
created: 2026-08-06
---

# 登录页与工作台首屏信息重设计

## 用户目标

基于根目录 README 的项目亮点、项目介绍和核心重点，重新组织登录页与登录后首页的展示层，让访问者在首屏快速理解 Cyber Scaffold 面向 AI 协作的全栈定位、工程结构、运行时契约和可持续演进价值。登录认证流程、导航数据来源和主题切换行为保持不变。

## 方案

- 登录页采用“编辑化系统蓝图”方向：左侧用品牌主张、三项能力标签和结构化视觉场景建立定位，右侧用更明确的身份入口、运行状态提示和本地账号说明完成登录。
- 工作台首屏保留“让系统脉络可见，让每次变更有据可循。”，新增项目定位摘要、能力指标和三项工程支柱，让静态项目价值与当前用户可访问的快捷入口同屏呈现。
- 固定展示文案继续通过 `auth.locales.ts` 与 `home.locales.ts` 提供中英文资源；动态菜单、登录 redirect、主题语义令牌和响应式断点不改变。

## 实施范围

- `apps/frontend/src/modules/system/auth/pages/components/LoginPresentation.vue`
- `apps/frontend/src/modules/system/auth/pages/components/LoginInteraction.vue`
- `apps/frontend/src/modules/system/auth/auth.locales.ts`
- `apps/frontend/src/modules/system/home/pages/HomePage.vue`
- `apps/frontend/src/modules/system/home/home.locales.ts`
- `docs/design/modules/auth.md`
- `docs/design/modules/home.md`
- `docs/design/modules/frontend.md`（本次未改变应用壳、路由或验证边界，无需改动）

## 验证

- 执行 `pnpm format` 后执行 `pnpm format:check`。
- 执行仓库允许的 TypeScript 检查与生产构建。
- 不创建或运行前端自动化、端到端或浏览器测试；由维护者人工验收桌面/窄屏登录页和工作台首屏。

实际结果：`pnpm format:check`、`pnpm lint`、`pnpm build` 和 `pnpm test` 全部通过；共享 API 契约构建通过，后端 14 个测试文件共 120 个测试通过。生产构建保留仓库既有的 Sass legacy API、依赖注释和静态/动态导入提示。

## 完成条件

- 代码、固定文案、当前设计、计划和 AI 协作记录描述一致。
- 记录实际验证结果、偏差和人工验收边界。
- 验证通过后将本计划与 AI 协作记录移入对应归档目录，并提交带真实模型 trailer 的 Git 提交。
