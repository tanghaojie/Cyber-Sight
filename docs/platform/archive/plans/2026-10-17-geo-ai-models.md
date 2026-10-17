---
title: AIModels 发布协议与 Geo 模型目录接入
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-10-17
updated: 2026-10-17
---

# AIModels 发布协议与 Geo 模型目录接入

## 目标与范围

根据维护者授权分别改造 AIModels 和 Cyber-Sight，并推送两个仓库。AIModels 发布机器可读目录；Geo 增加 AI 模型类型并一键加载主体和资源。仅修改 Platform Geo 与 AIModels 自有发布内容。

## 实施任务

- [x] AIModels 发布描述、目录生成与校验，保留原始定位和项目附件。
- [x] Geo 目录读取、校验与分组加载、取消和清理。
- [x] AI 模型卡片与质量选择、错误重试，保留三个 URL 入口。
- [x] 文档、静态检查与发布资源验证。
- [x] 完成记录归档、分别提交、推送并核对远端 SHA。

## 前置与风险

两个暂存区/工作区均为空。Cyber-Sight 归档审计 NOT_DUE。远端均未领先本地；Cyber-Sight 本地已有本次会话及前置交付提交待推送。模型坐标和高程含近似值；不能静默改地形。发布生效时间取决于 AIModels 自动部署。

## 验证与回滚

遵循[设计](../../design/modules/geo-ai-models.md)，执行发布脚本校验与工程检查，不运行前端自动化。回滚各仓库对应提交可撤回入口和发布协议，原模型二进制与手工 URL 加载不变。

## 实际结果

AIModels 已发布 8 个模型描述及 2 个额外质量版本，主体和资源由同源相对 URL 关联；发布生成校验、7 项 Python 回归、Ubuntu CI 通过。线上 9 个 JSON 匹配、10 个模型文件 SHA-256/字节数一致、131 个依赖/预览端点通过 HTTP 与 CORS 检查。Geo 已交付第四类型、卡片/搜索/质量选择、分组加载/取消/错误回收与地形保护；TypeScript/生产构建、修改文件 ESLint、模块边界、格式与归档 CI 均通过。未运行前端自动化，视觉及交互待维护者人工验收。

偏差：AIModels 首次 CI 暴露 Windows/Linux 目录大小写排序差异，已显式固定排序并增加回归，修正后 CI 通过。原有模型二进制及历史定位/场景文件未改动。提交：feat(geo): load published AIModels library；AIModels 功能 d9ff258、修正 37692bd。
