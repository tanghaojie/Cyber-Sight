---
title: CYBER 品牌与视觉系统
status: active
owner: project maintainers
updated: 2026-08-05
---

# CYBER 品牌与视觉系统

## 背景与目标

项目原先直接使用维护者个人品牌 `JTLab / 桀士实验室` 作为脚手架名称，导致产品身份与创作者身份混合。当前项目品牌调整为 `CYBER`，正式名称为 `Cyber Scaffold`，用克制的赛博朋克视觉表达 AI 原生、模块化、运行时契约和可演进系统底座。

## 范围与非目标

本设计覆盖默认产品命名、Logo、色彩、登录页、应用壳、浏览器元信息、Swagger、README 和品牌相关技术标识。它不改变模块边界、HTTP 契约、数据库表、业务行为或前端人工验收边界，也不把个人品牌扩展成框架内的功能模块。

## 品牌层级

- 产品短名称：`CYBER`。
- 正式名称：`Cyber Scaffold`。
- 默认产品标签：`SYSTEM SCAFFOLD`。
- 英文主张：`Build clearly. Evolve safely.`。
- 中文主张：`让复杂系统清晰生长。`。
- 创作者品牌：`JTLab / 桀士实验室`，只以明确标注 `CREATED BY` 的独立署名出现在登录页、README 作者信息等合适位置，不进入 CYBER Logo、侧栏、404 或工作台产品标识。

部署可以继续通过 `VITE_APP_NAME`、`VITE_APP_FULL_NAME`、`VITE_APP_TAGLINE` 和 `VITE_APP_PRODUCT_LABEL` 覆盖文字；替换图形标志时需要同步替换品牌组件和 favicon，避免非 CYBER 名称继续使用 C 形产品标。

## Logo 与视觉语言

默认 Logo 使用连续双层角形 `C`、右侧精密开口、薄荷绿结构端点和一个电紫数据节点。图形表达模块边界、受控数据流和智能核心，不使用盾牌、锁、机器人、大脑、黑客、加密货币或电竞视觉。

- 背景：石墨黑与接近黑色的层次。
- 主标：暖白色。
- 默认主强调色为翡翠绿；运行时可切换政务红、高级黑白灰、智蓝、灵感紫与琥珀橙。
- 节点色、品牌背景、光晕和结构端点随当前主题协调变化，不固定为绿色或电紫色。
- 管理页面保持清晰和低干扰；网格、节点与高对比视觉主要用于登录页、404 和品牌区域。

Logo 以仓库内 SVG/Vue 组件实现，保证侧栏、移动端、404 和 favicon 能按尺寸清晰渲染。创作者署名使用独立排版，不作为 Logo 的一部分。

## 技术标识与兼容性

默认根包名、浏览器存储键和 JWT 元数据同步采用 CYBER 命名：

- 根包名：`cyber-scaffold`。
- 访问令牌键：`cyber_access_token`。
- 标签历史键：`cyber_tag_view_history:v1:<userId>`。
- JWT issuer：`cyber-scaffold`。
- JWT audience：`cyber-scaffold-api`。

旧 `jtlib_access_token` 会在认证状态清理时一并删除。JWT issuer/audience 切换会使旧令牌失效，用户需要重新登录；数据库账号、菜单、授权和业务数据不迁移也不删除。旧标签历史不迁移，切换后从新的版本化键开始记录。

## 失败模式与安全考虑

- 环境变量只替换文字但未替换 Logo：部署方可能出现名称和 C 形产品标不一致；README 明确要求白标部署同步替换视觉资产。
- 旧认证 cookie 残留：读取不到新键时按未登录处理，清会话时同时清理旧键。
- Logo 在小尺寸失真：组件保留强轮廓、有限色彩和独立 favicon，并通过生产构建与维护者人工检查验证。
- 品牌重命名不得弱化 JWT 的 issuer/audience 校验，也不得为兼容旧品牌而接受多个签发方。

## 测试与验证策略

- 执行根目录格式化、格式检查、ESLint、TypeScript/生产构建和后端测试。
- 搜索当前代码与现行文档，确认旧产品品牌和旧技术标识只保留在明确的兼容性说明中。
- 维护者人工验收桌面与窄屏登录页、侧栏、404、工作台、favicon、浏览器标题和 Swagger 品牌展示；前端不创建或运行自动化测试。

## 相关 ADR、计划和 AI 日志

- [ADR-0028：分离 CYBER 产品品牌与 JTLab 创作者品牌](../decisions/ADR-0028-product-and-creator-brand-separation.md)
- [实施计划](../archive/plans/2026-07-31-cyber-branding.md)
- [AI 协作记录](../archive/ai-logs/2026/07/2026-07-31-cyber-branding.md)
