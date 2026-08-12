---
title: 菜单分层路由与 SVG 图标注册表
status: completed
created: 2026-07-28
updated: 2026-07-28
---

# 菜单分层路由与 SVG 图标注册表

## 目标

支持目录与菜单的分层站内路径，移除前端菜单编码配置，并把内联图标迁移为 Vite 自动发现的 SVG sprite 和下拉选项。

## 背景与设计依据

现有共享契约要求所有菜单路径为绝对路径且目录路径为空；`AppIcon.vue` 以内联分支维护图形，菜单图标为自由文本。实现依据菜单模块、前端应用壳、ADR-0010、ADR-0017 和 ADR-0018。

## 范围

- 菜单写入契约与后端父节点路径校验。
- 前端菜单表单、动态路由和导航路径解析。
- SVG 文件拆分、Vite/Vitest 插件、图标注册表和选择器。
- 相关测试与现行文档。

## 非目标

- 本轮不删除数据库和 API 中的 `code` 字段；只把它降为前端不可见的兼容键。
- 目录本身不变为可点击页面。
- 不引入远程或用户上传图标。

## 前置条件和风险

- 新依赖必须兼容 Vite 5、Vitest 2 和当前 Node 运行时。
- 旧目录记录可能没有路径，运行时需保持透明前缀兼容。
- 相对路径必须在导航、侧栏和动态路由中解析一致。

## 实施任务

- [x] 更新现行设计、ADR、计划和 AI 协作记录。
- [x] 先增加路径规则与 SVG 组件的失败测试。
- [x] 调整共享契约、后端校验和导航路径解析。
- [x] 拆分 SVG、接入插件并改造 `AppIcon` 与菜单图标下拉框。
- [x] 移除前端可见编码字段并保留写入兼容。
- [x] 运行类型检查、测试、构建和浏览器检查。
- [x] 补全最终文档、归档计划与日志并创建 AI 标记提交。

## 测试与验证

- `pnpm test`：通过；API 契约 TypeScript 检查、后端 54 个测试和前端 41 个测试全部通过。
- `pnpm build`：通过；API 契约、后端 TypeScript 和前端 `vue-tsc`/Vite 生产构建全部通过。
- 浏览器：桌面端菜单列表、目录/菜单路由字段、根/子节点提示、20 个 SVG 图标选项及图标渲染通过；390px 窄屏检查保持现有桌面优先壳层行为。
- `git diff --check`：通过。

## 发布与回滚

常规前后端同步发布。回滚时同时回滚契约、后端与前端提交；数据库无结构迁移。

## 实际偏差和遗留问题

- `vite-plugin-svg-icons` 在 pnpm 严格依赖环境下运行时需要 `fast-glob`，因此将其作为前端显式依赖安装。
- Vitest 在部分旧布局测试中会把 SVG 名称虚拟模块包装为双层 `default`；图标注册表兼容数组和包装对象两种形态。
- 本轮不处理既有管理端壳层在 390px 下的横向溢出，也不迁移存量空目录路径；两者均不影响本轮新增规则。
- 关联提交：本计划随最终功能提交一并归档。

## 相关设计、ADR 和 AI 日志

- `docs/design/modules/menus.md`
- `docs/design/frontend-shell.md`
- `docs/decisions/ADR-0010-database-navigation-and-controlled-view-registry.md`
- `docs/decisions/ADR-0017-database-selected-layout-registry.md`
- `docs/decisions/ADR-0018-vite-svg-icon-registry.md`
- `docs/archive/ai-logs/2026/07/2026-07-28-menu-routing-svg-icons.md`
