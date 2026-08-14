---
title: Foundation 与 Platform 分层运行时配置
scope: foundation
repository: Cyber-AI-Forge
owner: project maintainers
status: accepted
date: 2026-08-13
---

# ADR-20260813：Foundation 与 Platform 分层运行时配置

## 背景

前端品牌配置位于 Platform，而后端原有 `env.ts` 同时解析 Foundation 和 Platform 字段。Forge 脚手架与下游业务平台需要独立维护环境配置，不能因共同编辑单个 `.env.example` 或配置实现而产生同步冲突。

## 决策驱动因素

- 维持 Foundation 只能依赖自身、Platform 可以依赖 Foundation 的单向边界。
- 让 Forge 和业务平台分别拥有自己的示例文件和配置字段。
- 让本地文件和部署进程环境支持明确、可测试的覆盖优先级。
- 避免把后端密钥暴露给前端。

## 考虑的方案

1. 继续使用一个 `.env` 和一个统一配置模块。
2. 建立跨前后端的共享配置 package。
3. Foundation/Platform 分层文件与解析器，由 Integration 入口聚合。

## 决策

采用方案 3。后端使用 Foundation 与 Platform 独立 Zod 解析器，由 `src/config/runtime.config.ts` 聚合；前端使用 Foundation 与 Platform 独立配置对象，由 `src/config/runtime.config.ts` 聚合。前后端分别以各自 workspace 的 `env/` 为环境目录，文件加载顺序为 `.env`、`.env.local`、`.env.foundation.local`、`.env.platform.local`、进程环境，后者覆盖前者。Vite 只注入 `VITE_*`。

## 正面结果

- Forge 更新 Foundation 配置时不会覆盖 Platform 文件；Platform 修改业务配置时不会修改 Foundation 实现。
- 后端数据库/JWT 安全配置和 Platform API/JWT identity 配置的校验责任清晰。
- 前端应用和 Vite 使用同一组分层变量，配置入口统一。
- 进程环境可在容器部署中覆盖所有本地文件。

## 负面结果与风险

- 配置文件和入口数量增加，开发者需要分别复制两个 `.example` 文件。
- Integration 文件属于合并控制面，仍需同步工具和人工验证。
- 同名变量由 Platform 或部署环境覆盖 Foundation 默认值时，必须依靠 Foundation 解析器保证安全约束。

## 验证和复审条件

- Foundation 不导入 Platform，架构检查持续通过。
- 后端配置测试覆盖分层优先级和安全字段校验。
- 前端构建产物不包含非 `VITE_*` 变量。
- 若未来多个应用需要完全相同的解析实现，再评估共享 package；在此之前保持 Node 与 Vite 适配器独立。

## 相关设计和计划

- [分层运行时配置](../design/runtime-configuration.md)
- [Platform 运行时配置](../../platform/design/runtime-configuration.md)
- [实施计划](../archive/plans/2026-08-13-layered-runtime-configuration.md)
