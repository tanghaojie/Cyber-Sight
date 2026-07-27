---
title: 前端模块页面自动注册与 SCSS 重构
status: completed
created: 2026-07-27
updated: 2026-07-27
---

# 前端模块页面自动注册与 SCSS 重构

## 目标

提高左侧菜单对比度；把动态页面登记下沉到业务模块并自动发现；把臃肿的全局 CSS 迁移为按职责和 Element Plus 组件拆分的 SCSS。

## 背景与设计依据

当前中心 `view-registry.ts` 手工导入所有业务模块，`main.css` 同时包含令牌、布局、页面和多个 Element Plus 组件覆盖。实现依据前端应用壳设计、动态导航设计、模块边界以及 ADR-0010、ADR-0012。

## 范围

- 构建期自动发现模块 `view-registry.ts` 并生成只读页面注册表。
- 为现有动态页面模块增加本地注册文件和注册冲突测试。
- 将全局 CSS 迁移为 SCSS，拆分基础、页面、侧栏和 Element Plus 覆盖。
- 将侧栏底色改为高对比度的中性偏黑配色。
- 更新依赖、设计、索引和验证记录。

## 非目标

- 不改变数据库菜单契约、现有组件标识和业务 URL。
- 不允许数据库路径或任意运行时组件加载。
- 不重写各 Vue 单文件组件的 scoped 样式。

## 前置条件和风险

- Vite `import.meta.glob` 是构建期发现能力，Vitest 必须通过 Vite 转换执行相关测试。
- SCSS 与 Tailwind v4 的入口组合需要由生产构建验证。
- 开始时暂存区和工作区均为空。

## 实施任务

- [x] 审阅仓库设计、ADR、现有路由和全局样式。
- [x] 更新设计并建立 ADR、计划与 AI 日志。
- [x] 实现模块页面自动注册和测试。
- [x] 拆分 SCSS、调整侧栏配色并更新依赖。
- [x] 执行前端测试、类型检查、生产构建和浏览器视觉验证。
- [x] 回写最终验证、归档计划并创建带 AI trailer 的提交。

## 测试与验证

- `pnpm test`：通过；API 契约 TypeScript 检查通过，后端 41 项、前端 28 项测试全部成功。
- `pnpm build`：通过；API 契约、Fastify 后端和 Vue/Vite 前端生产构建成功。
- `git diff --check`：通过。
- 构建产物成功包含五个模块自动发现的页面懒加载 chunk；注册表测试覆盖内置模块发现、重复标识、非法文件和非法名称。
- 本地浏览器以真实后端和数据库登录检查桌面控制台、用户管理页与 390 × 844 窄屏侧栏；页面控制台无 warning/error。
- 计算样式确认侧栏为 `rgb(21, 24, 23)` 到 `rgb(9, 11, 10)` 的中性偏黑渐变，非活动菜单文字为 `rgba(241, 245, 243, 0.76)`；Element Plus 主色为 `#70cfa2`、基础圆角为 `11px`，按钮、输入框和表格覆盖均生效。

## 发布与回滚

本次不涉及数据库和后端发布。回滚提交即可恢复中心注册表与原 CSS 入口。

## 实际偏差和遗留问题

- Element Plus 按需组件 CSS 在全局入口之后装载，普通同级选择器会被覆盖。实现通过 `html:root` 和 `html body .el-*` 提升项目覆盖优先级，并由浏览器计算样式复核。
- Sass 1.102 的 `@parcel/watcher` 构建脚本不是 Vite 预处理必需项，仓库 `allowBuilds` 明确设为 `false`，没有扩大依赖脚本许可范围。
- Vite 5 调用 Dart Sass 时输出 legacy JS API 弃用提示，第三方 `@vueuse/core` 仍有 PURE 注释位置提示；两者均为非阻塞上游警告，构建产物正常生成。

## 相关设计、ADR 和 AI 日志

- `docs/archive/design/frontend-shell.md`
- `docs/archive/design/dynamic-navigation-and-branding.md`
- `docs/design/modules/frontend.md`
- `docs/decisions/ADR-0012-module-view-registration-and-scss-layering.md`
- `docs/archive/ai-logs/2026/07/2026-07-27-frontend-registry-and-scss.md`
