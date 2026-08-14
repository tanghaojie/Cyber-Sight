---
title: 前端 TypeScript 模块使用无扩展名导入
status: accepted
date: 2026-07-29
---

# ADR-0023：前端 TypeScript 模块使用无扩展名导入

## 背景

仓库的后端与契约包使用 Node.js 原生 ESM 和 TypeScript `NodeNext`，源码引用必须书写编译后
可执行的 `.js` 路径。前端由 Vite 打包并使用 TypeScript `Bundler` 模块解析，却沿用了相同
写法，使本地 `.ts` 文件在源码中看起来指向 `.js` 文件，增加阅读时的认知负担。

## 决策

`apps/frontend` 中指向本地 TypeScript 模块的静态导入、导出和动态导入省略扩展名。Vue 单文件
组件继续保留 `.vue` 后缀，第三方包保持包名导入。`apps/backend`、`packages/api-contract` 以及
其他由 Node.js 原生 ESM 直接执行编译产物的 workspace 继续使用 `.js` 后缀。

## 结果

- 前端源码引用直接表达模块逻辑名称，不再以运行时 `.js` 产物名称干扰阅读。
- 前端与 Node ESM workspace 的导入写法有意不同，反映各自实际的解析与执行模型。
- 若前端源码未来脱离打包器由 Node.js 原生 ESM 直接执行，需要重新评估该约定。

## 验证

- `apps/frontend/src` 中不存在以 `.js` 结尾的本地模块 specifier。
- `.vue` 组件引用仍保留 `.vue` 后缀。
- 前端 TypeScript 检查和 Vite 生产构建通过。

## 相关文档

- `docs/design/developer-workflow.md`
- `docs/archive/plans/2026-07-29-frontend-extensionless-imports.md`
