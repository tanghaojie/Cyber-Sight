---
title: 前后端系统与业务模块分类
status: accepted
date: 2026-07-30
---

# ADR-0027：前后端系统与业务模块分类

## 背景

脚手架现有前后端模块都直接位于 `src/modules/<module>/`。这些模块实际属于脚手架提供的认证、授权、系统管理、导航、工作台、健康检查和错误处理能力；继续把后续产品业务模块放在同一级，会弱化模板能力与具体业务之间的边界。

## 决策驱动因素

- 从目录上区分脚手架内置能力与项目业务能力。
- 保留模块化、表意公共文件和单向依赖约束。
- 不改变稳定模块名、HTTP 路由或共享契约导出。
- 让前端页面自动发现覆盖两个合法分类，同时拒绝新的根级模块。

## 考虑的方案

1. 维持扁平 `modules/<module>`，仅用命名区分：迁移成本低，但不能形成可靠边界。
2. 前后端增加 `system` 与 `biz` 两级分类，契约保持扁平：目录意图清晰，且不会把应用组织标签泄漏到公共契约。
3. 三个 workspace 全部增加分类：最对称，但扩大本次前后端整理范围并改变包内公共导入路径。

## 决策

采用方案 2：

- `apps/frontend/src/modules/system/<module>/` 与 `apps/backend/src/modules/system/<module>/` 保存脚手架内置系统能力。
- `apps/frontend/src/modules/biz/<module>/` 与 `apps/backend/src/modules/biz/<module>/` 保存后续产品业务能力；分类目录用 README 保留并说明用途。
- 前后端 `src/modules/` 下不得新增与 `system`、`biz` 平级的模块。
- `packages/api-contract/src/modules/<module>/` 保持不变；模块名继续在各层一致。
- 前端页面注册表显式扫描 `system` 与 `biz`，模块间导入携带所属分类路径。

## 正面结果

- 目录结构直接表达系统能力与产品业务的边界。
- 后续新增业务模块有稳定落点，不会与脚手架模块混杂。
- 契约包导出和 HTTP 行为无需迁移。

## 负面结果与风险

- 前后端模块导入路径增加一级目录。
- 新模块分类错误仍需代码审阅和结构检查发现。
- 契约目录与应用目录不完全对称，维护者需根据模块名而不是完整相对路径对应三层实现。

## 验证和复审条件

- 前后端根级 `modules/` 只包含 `system`、`biz` 和说明文件。
- 旧的 `@/modules/<module>` 与 `./modules/<module>` 导入无残留。
- 前端构建能发现 `system` 下的全部 `registerViews.ts`，后端构建和测试通过。
- 如果未来契约也需要按类别独立发布或生成，再复审契约目录是否引入同类分类。

## 相关设计和计划

- [模块边界](../design/module-boundaries.md)
- [前端应用与应用壳](../design/modules/frontend.md)
- [后端模块设计](../design/modules/backend.md)
- [实施计划](../archive/plans/2026-07-30-system-biz-module-layout.md)
