---
title: 前端品牌文字配置收敛
status: accepted
date: 2026-08-11
---

# ADR-20260811-frontend-brand-text-config：前端品牌文字配置收敛

## 背景

前端原本使用 `VITE_APP_TAGLINE` 和 `VITE_APP_PRODUCT_LABEL` 两个变量承载相同英文副标题的不同大小写。它们的显示位置不同，但没有独立的业务语义；同时，动态浏览器标题的无路由标题回退应使用正式产品名称，而不是副标题。

## 决策驱动因素

- 减少部署时需要维护的品牌文字配置项。
- 保留登录页签名与 Logo 产品描述的不同视觉表现。
- 让无路由专属标题时的浏览器标题表达正式产品名称。
- 保持现有 `CYBER / Cyber AI Forge` 品牌层级和白标覆盖能力。

## 考虑的方案

1. 继续维护 `VITE_APP_TAGLINE` 和 `VITE_APP_PRODUCT_LABEL` 两个变量。
2. 删除 `VITE_APP_TAGLINE`，统一使用产品标签。
3. 保留 `VITE_APP_TAGLINE`，删除产品标签；登录页使用原文，Logo 描述使用大写，浏览器标题回退使用正式名称。

## 决策

采用方案 3：删除 `VITE_APP_PRODUCT_LABEL` 及对应的 `appConfig.productLabel`。所有原产品标签使用位置改为读取 `appConfig.tagline`；`CyberLogo` 只在 Logo 下方的产品描述位置调用 `.toUpperCase()`，登录页签名保持原始大小写。动态标题在没有路由专属标题时使用 `appConfig.fullName`，再与短名称组合。

## 正面结果

- 前端白标配置从四个品牌文字变量减少为三个。
- 一个 `VITE_APP_TAGLINE` 可覆盖登录签名和 Logo 产品描述。
- Logo 仍保持全大写产品描述，登录签名仍保持可读的原始大小写。
- 无专属路由标题时，浏览器标题使用正式产品名。

## 负面结果与风险

- 不能再独立配置登录签名和 Logo 产品描述的文案内容，只能在展示层区分大小写。
- 非英文或大小写无意义的自定义 tagline 经过 `.toUpperCase()` 后仍会作为 Logo 描述显示，需要白标维护者人工验收。

## 验证和复审条件

- 搜索确认运行时代码、示例环境文件和操作说明不再引用 `VITE_APP_PRODUCT_LABEL` 或 `appConfig.productLabel`；ADR、计划和 AI 日志可以保留迁移依据中的历史名称。
- 运行格式检查、前端 TypeScript 检查和生产构建。
- 人工验收登录页签名、Logo 描述和动态浏览器标题。

## 相关设计和计划

- [CYBER 品牌与视觉系统](../design/branding.md)
- [前端应用与应用壳](../design/modules/frontend.md)
- [实施计划](../archive/plans/2026-08-11-frontend-brand-text-config.md)
