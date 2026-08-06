---
title: 登录页主题外观入口
status: completed
created: 2026-08-07
updated: 2026-08-07
---

# 登录页主题外观入口

## 目标

在登录页提供可发现、可键盘操作的外观入口，让用户在认证前切换深色模式和六套主题颜色，并复用现有设备级设置的即时生效与持久化语义。

## 背景与设计依据

- `docs/design/modules/auth.md` 将登录页交互限定在认证表单与页面组合，认证流程不因视觉偏好改变。
- `docs/design/modules/settings.md` 将 `settings.store.ts` 和 `settings.theme.ts` 登记为主题偏好的公共接口，`ThemeController.vue` 在应用根同步 CSS 令牌。
- 登录页已有语言切换器，入口放在同一右上角工具区，采用紧凑的 CYBER 工业仪表风格。

## 范围

- 新增登录页私有 `LoginAppearanceControls.vue`，包含外观入口、深色模式开关和主题色单选网格。
- 扩展 settings 中英文资源，提供入口、面板和可访问性文案。
- 更新 auth、settings、frontend 现行设计文档，记录新的消费关系与人工验收项。

## 非目标

- 不修改认证接口、会话、redirect、cookie 或 API 契约。
- 不新增后端字段、账号级偏好同步或新的主题存储键。
- 不新增或运行前端自动化、浏览器或端到端测试。

## 前置条件和风险

- `ThemeController` 必须继续由 `App.vue` 包裹登录页，确保登录页切换后立即更新 CSS 变量。
- 登录页组件只能调用 settings 模块登记的 Store、主题元数据和全局本地化键，不能读取 settings 私有实现。
- Popover 关闭、刷新或重新登录不应回滚已应用的偏好；浏览器存储不可用时仍依赖 Store 的内存降级。

## 实施任务

- [x] 创建登录页外观控制组件并接入现有 settings Store。
- [x] 增加中英文外观文案并保持资源键集合一致。
- [x] 更新设计、计划和 AI 协作记录的实际结果。
- [x] 执行格式化、格式检查、TypeScript 检查、生产构建和最终 diff 检查。
- [x] 归档完成的计划与 AI 协作记录，并创建带真实模型 trailer 的提交。

## 测试与验证

- 已执行 `pnpm format`、`pnpm format:check`、`pnpm lint` 和前端 `pnpm --filter @scaffold/frontend build`；构建内含 `vue-tsc`，全部通过。
- `git diff --check` 通过。生产构建保留 Sass legacy API、依赖注释和既有静态/动态导入提示，不影响构建成功。
- 维护者人工验收项已补充到 auth/settings 设计文档：入口可见、键盘焦点清晰、深色模式与六色主题即时更新、刷新恢复以及认证后的应用壳复用偏好。

## 发布与回滚

发布只涉及前端组件、资源和现行文档。若入口出现问题，可回滚本次提交；现有 `cyber_system_settings:v1` 结构保持兼容，无需数据迁移。

## 实际偏差和遗留问题

无。前端自动化和浏览器验收仍按仓库边界由维护者执行。

## 相关设计、ADR 和 AI 日志

- [认证模块](../../design/modules/auth.md)
- [系统设置模块](../../design/modules/settings.md)
- [前端应用与应用壳](../../design/modules/frontend.md)
- [AI 协作记录](../ai-logs/2026/08/2026-08-07-login-appearance-entry.md)
- 关联提交：`feat(auth): add login appearance controls`。
