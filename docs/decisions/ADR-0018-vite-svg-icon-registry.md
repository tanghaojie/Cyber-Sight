---
title: 由 Vite 构建期生成 SVG 图标注册表
status: accepted
date: 2026-07-28
---

# ADR-0018：由 Vite 构建期生成 SVG 图标注册表

## 背景

共享 `AppIcon.vue` 把全部 SVG 路径以内联条件分支维护，新增图标必须修改组件，菜单图标又依赖自由文本，无法发现可选名称或阻止拼写漂移。

## 决策

每个图标以独立文件放在 `apps/frontend/src/assets/icons/`。Vite 与 Vitest 使用 `vite-plugin-svg-icons` 的 `createSvgIconsPlugin` 在构建期生成 SVG sprite；应用入口加载 `virtual:svg-icons-register`，共享图标注册表读取 `virtual:svg-icons-names` 并导出稳定名称及菜单下拉选项。

`AppIcon.vue` 只负责通过 `<use href="#icon-{name}">` 渲染 sprite，未知名称回退到 `alert`。菜单管理不接受自由文本图标名，只允许从构建期清单中选择。

## 结果与风险

- 图形源与 Vue 逻辑解耦，新增或删除 SVG 文件会同步影响运行时 sprite 和表单选项。
- 所有图标共享一次注入的 sprite，避免为每个实例重复内联完整路径。
- 文件名成为持久化稳定标识；重命名文件会让存量菜单引用失效，因此未知名称必须提供安全回退。
- 插件虚拟模块必须同时纳入 Vite、Vitest 和 TypeScript 类型环境。
- `fast-glob` 作为前端显式依赖固定，避免插件在 pnpm 严格依赖环境中因未声明传递依赖而启动失败。
- 图标名称注册表兼容 Vitest 的 CJS `default` 包装，同时保持生产环境的数组导出路径。

## 验证和复审条件

- 单元测试覆盖名称清单、已知图标和未知图标回退。
- 前端类型检查、Vitest 和生产构建必须通过。
- 若未来改用远程图标集或需要按租户上传资源，重新评估构建期白名单和资源信任边界。

## 相关设计

- `docs/design/frontend-shell.md`
- `docs/design/modules/frontend.md`
