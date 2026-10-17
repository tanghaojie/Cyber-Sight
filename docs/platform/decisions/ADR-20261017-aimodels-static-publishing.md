---
title: AIModels 版本化静态发布协议
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: accepted
date: 2026-10-17
---

# ADR-20261017：AIModels 版本化静态发布协议

## 背景与决策

维护者确认 Geo 从 AIModels 自动发现模型并一键加载。采用 catalog.json + 项目 model.json 的版本化静态发布协议，不解析 Markdown、HTML 目录列表或运行时 GitHub API，不增加资产后端。发布描述明确位置来源、椭球高、资源关联、质量版本和署名；Geo 运行时校验后加载。

## 结果与取舍

AIModels 可独立增加模型，Geo 不硬编码模型清单；生成脚本与 CI 负责目录和资源的一致性。两个仓库需保持协议版本兼容，缓存及部署必须验证。明确发布的坐标适用于目录加载，用户手工模型 URL 继续确认坐标来源。第一版不改变第三方模型通用加载与 Scene 渲染策略。

## 验证和复审

协议字段、资源类型或信任来源变化时升级版本并同步双方规范；按[模块设计](../design/modules/geo-ai-models.md)验证。
