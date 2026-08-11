---
title: Cyber-Sight 下游身份与上游兼容边界
status: accepted
date: 2026-08-11
---

# ADR-20260811：Cyber-Sight 下游身份与上游兼容边界

## 背景

Cyber-Sight 基于维护者的开源项目 Cyber AI Forge 建立。GitHub 不允许在同一所有者下把仓库 fork 回自身，因此 Cyber-Sight 以独立仓库保存共同 Git 历史，并通过 `upstream` 远端持续获取脚手架更新。Cyber-Sight 后续将增加独立业务能力，不能继续把自身公开身份描述为 Cyber AI Forge 脚手架，也不能为了改名破坏上游合并和现有运行时兼容性。

## 决策驱动因素

- 让用户可见的仓库、界面、Swagger 和推广站统一识别为 Cyber-Sight。
- 明确 Cyber AI Forge 是工程基线和上游来源，不把其作者关系或许可证贡献隐藏。
- 保留共同提交历史，以标准 Git merge 获取上游更新。
- 避免仅为展示改名而变更 workspace 导入、JWT 校验、浏览器存储或数据库。
- 让人类和 AI 使用相同、可审查的同步流程，阻止误推上游。

## 考虑的方案

1. 继续全部显示 Cyber AI Forge：同步冲突最少，但 Cyber-Sight 无法形成独立产品身份。
2. 全量重命名所有代码和技术标识：表面一致，但会扩大上游冲突、使会话失效并增加无业务价值的迁移。
3. 将产品可见层迁移为 Cyber-Sight，保留 Cyber AI Forge 技术兼容标识并建立下游文件所有权：兼顾产品独立和持续同步。

## 决策

采用方案 3：

- 正式产品名为 `Cyber-Sight`，界面短名称为 `CYBER-SIGHT`。
- 英文产品标签为 `AI-NATIVE BUSINESS APPLICATION`，中文说明为 `AI 原生业务应用`；在业务定位正式确定前不虚构行业能力。
- 保留现有 C 形 Logo、石墨黑、暖白、薄荷绿与电紫节点视觉；资产文件名可以继续使用 `cyber-*`，文件名不作为产品正式名称。
- `JTLab / 桀士实验室` 继续作为与产品 Logo 分离的创作者署名。
- README、前端默认展示、浏览器元信息、Swagger、关于页、推广站和公开 URL 改为 Cyber-Sight，并明确 `Built on Cyber AI Forge` / `基于 Cyber AI Forge 构建`。
- 根包名 `cyber-ai-forge`、workspace 作用域 `@cyber-ai-forge/*`、JWT issuer/audience、浏览器存储键和脚手架系统表不改名。这些是上游兼容或运行时标识，不是当前 UI 品牌。
- `origin` 是唯一日常推送目标；`upstream` 只获取 Cyber AI Forge 更新，本地 push URL 必须禁用。
- 上游同步使用显式 fetch、专用同步分支和保留父提交的 merge；下游品牌和业务文件由 Cyber-Sight 拥有。

本 ADR 取代 ADR-0028 与 ADR-0031 对当前产品名称和品牌基线的决定，同时继承其中“产品与创作者署名分离”和“技术标识变更必须有兼容性理由”的原则。

## 正面结果

- Cyber-Sight 拥有独立、清楚的公开身份。
- 上游提交身份、共同历史和系统模块更新路径保持完整。
- 本次品牌迁移不使现有 JWT、浏览器状态、包导入或数据库失效。
- 同步冲突有明确的文件所有权和人工审查边界。

## 负面结果与风险

- 代码中仍会合理出现 `cyber-ai-forge` 技术标识，需要文档解释它们不是品牌遗漏。
- README、品牌配置和推广站成为下游拥有文件，上游修改这些文件时必须人工移植，无法零冲突自动同步。
- Cyber-Sight 业务定位尚未确定，现阶段品牌说明只能保持中性，后续需要随正式业务设计更新。

## 验证和复审条件

- 当前公开入口和运行时产品名称不再把 Cyber-Sight 描述成 Cyber AI Forge 本身。
- 静态搜索确认遗留 Cyber AI Forge 文本只用于上游归属、继承能力或技术兼容说明。
- 本地 Git 配置阻止无意 push 到 `upstream`，并让 `master` 跟踪 `origin/master`。
- 如果 Cyber-Sight 未来需要发布独立 workspace 包、强制注销会话、迁移存储键或完全脱离 Cyber AI Forge，再单独复审技术标识。

## 相关设计

- [Cyber-Sight 品牌与视觉系统](../design/branding.md)
- [Cyber AI Forge 上游同步](../design/upstream-synchronization.md)
