---
title: Cyber AI Forge 品牌与项目级技术标识
status: accepted
date: 2026-08-07
---

# ADR-0031：Cyber AI Forge 品牌与项目级技术标识

## 背景

项目原正式名称为 `Cyber Scaffold`，当前定位升级为面向企业应用的 AI 原生智能构建平台。用户确认新的正式名称为 `Cyber AI Forge`，并要求使用英文副标题 `AI-Native Enterprise Application Scaffold` 与中文副标题 `AI 驱动的企业应用智能构建平台`。

## 决策驱动因素

- 让产品名称直接表达 AI 驱动、企业应用和持续构建的定位。
- 保留 `CYBER` 短品牌、现有 Logo 语义和 JTLab 独立创作者署名。
- 让运行时界面、文档、Swagger、包元数据和项目级安全标识保持同一命名基线。
- 通过版本化浏览器键和严格 JWT issuer/audience，避免新旧会话或本地状态混用。

## 考虑的方案

1. 只替换 README 和页面标题：改动最小，但运行时配置、Swagger 和技术标识会继续暴露旧名称。
2. 完全重命名所有内部包作用域、目录和 GitHub URL：一致性最高，但会扩大外部兼容性风险。
3. 采用 `CYBER / Cyber AI Forge` 作为产品品牌，更新根包名、项目级认证和浏览器存储标识，并将内部工作区作用域迁移为 `@cyber-ai-forge/*`，保留现有 GitHub URL：在品牌一致性和迁移范围之间取得平衡。

## 决策

采用方案 3：

- 产品短名称保持 `CYBER`，正式名称改为 `Cyber AI Forge`。
- 英文副标题统一为 `AI-Native Enterprise Application Scaffold`；中文副标题统一为 `AI 驱动的企业应用智能构建平台`。
- 根包名改为 `cyber-ai-forge`。
- JWT issuer 改为 `cyber-ai-forge`，audience 改为 `cyber-ai-forge-api`；旧 JWT 不再通过校验。
- 访问令牌、语言偏好和标签历史使用新的 `cyber_ai_forge_*` 版本化键；访问令牌清理逻辑同时删除旧 `cyber_access_token` 和 `jtlib_access_token`。
- `@cyber-ai-forge/*` 作为内部工作区包作用域，GitHub URL 继续指向当前仓库；包作用域不作为用户界面品牌展示。
- JTLab / 桀士实验室只出现在明确的创作者署名中，不进入产品 Logo、侧栏、404、工作台或 Swagger 主品牌。

## 正面结果

- 用户界面、文档和 API 调试入口统一使用新产品名与企业应用定位。
- 新旧 JWT 和访问令牌状态不会被错误混用。
- 不修改数据库、API 路由、业务数据和 GitHub 地址，降低发布范围。

## 负面结果与风险

- 已有 JWT 会话全部失效，用户需要重新登录。
- 旧标签历史和语言偏好不迁移；旧访问令牌键只做清理。
- 内部包现使用 `@cyber-ai-forge/*`，源代码导入路径与正式产品品牌一致；此次迁移仅改变 workspace 包标识，不改变 HTTP API、数据库或运行时业务行为。
- 迁移需要同步更新包元数据、workspace 依赖、源码导入、脚本过滤器、锁文件和现行文档；历史归档保留原始作用域作为过程证据。
- GitHub 仓库展示名可在外部平台单独修改，本次提交不改变远端资源。

## 验证和复审条件

- 当前代码和现行文档统一使用 `Cyber AI Forge`、两条副标题和 `@cyber-ai-forge/*` workspace 作用域；旧作用域只保留在历史归档或必要的迁移说明中。
- 登录页、工作台、关于页、侧栏、404、HTML 元信息和 Swagger 完成维护者人工验收。
- 后端 JWT 测试验证新 issuer/audience，静态搜索验证旧项目级键不再作为当前值。
- 如果未来需要公开发布包、迁移 GitHub 仓库、迁移历史本地数据或更换组织品牌，再单独复审本 ADR。

## 相关设计和计划

- [当前品牌与视觉系统](../../design/branding.md)
- [Cyber AI Forge 品牌与项目标识改名](../plans/2026-08-07-cyber-ai-forge-renaming.md)
- [Cyber AI Forge workspace 包作用域迁移](../plans/2026-08-10-cyber-ai-forge-package-scope.md)
