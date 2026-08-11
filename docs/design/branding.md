---
title: Cyber-Sight 品牌与视觉系统
status: active
owner: project maintainers
updated: 2026-08-11
---

# Cyber-Sight 品牌与视觉系统

## 背景与目标

Cyber-Sight 是以 Cyber AI Forge 为工程基线持续演进的独立产品仓库。当前品牌需要让用户首先识别 Cyber-Sight，同时明确脚手架来源和创作者归属；不能继续把下游产品描述成 Cyber AI Forge 本身，也不能仅为展示改名而破坏共同 Git 历史、workspace 导入、JWT 会话或浏览器状态。

视觉继续使用克制的赛博朋克语言表达清晰边界、受控数据流和可演进系统。Cyber AI Forge 以 `Built on Cyber AI Forge` / `基于 Cyber AI Forge 构建` 的工程基线身份出现，不与 Cyber-Sight 主品牌争夺层级。

## 范围与非目标

本设计覆盖默认产品命名、Logo、色彩、登录页、应用壳、浏览器元信息、Swagger、README、推广站和公开 URL。它不改变模块边界、HTTP 契约、数据库表、业务行为或前端人工验收边界，也不重命名 Cyber AI Forge 兼容技术标识。

## 品牌层级

- 产品短名称：`CYBER-SIGHT`。
- 正式名称：`Cyber-Sight`。
- 英文副标题：`AI-Native Business Application`。
- 中文副标题：`AI 原生业务应用`。
- 默认产品标签：`AI-NATIVE BUSINESS APPLICATION`。
- 英文主张：`Build clearly. Evolve safely.`。
- 中文主张：`让复杂系统清晰生长。`。
- 工程基线署名：`Built on Cyber AI Forge` / `基于 Cyber AI Forge 构建`。
- 创作者品牌：`JTLab / 桀士实验室`，只以明确标注 `CREATED BY` 的独立署名出现在登录页、README 作者信息等合适位置，不进入 Cyber-Sight Logo、侧栏、404 或工作台产品标识。

部署可以继续通过 `VITE_APP_NAME`、`VITE_APP_FULL_NAME`、`VITE_APP_TAGLINE`、`VITE_APP_PRODUCT_LABEL` 和 `VITE_APP_GITHUB_URL` 覆盖文字与仓库入口；替换图形标志时需要同步替换品牌组件和 favicon。Cyber-Sight 仍以 C 开头，可以继续使用现有 C 形标志。

## Logo 与视觉语言

默认 Logo 沿用连续双层角形 `C`、右侧精密开口、薄荷绿结构端点和一个电紫数据节点。图形表达 Cyber-Sight 的清晰边界、受控数据流和智能核心，不使用盾牌、锁、机器人、大脑、黑客、加密货币或电竞视觉。

- 背景：石墨黑与接近黑色的层次。
- 主标：暖白色。
- 默认主强调色为翡翠绿；运行时可切换御政丹红、曜石银灰、深空智蓝、灵感紫与琥珀橙。
- 节点色、品牌背景、光晕和结构端点随当前主题协调变化，不固定为绿色或电紫色。
- 管理页面保持清晰和低干扰；网格、节点与高对比视觉主要用于登录页、404 和品牌区域。

Logo 以仓库内 SVG/Vue 组件实现，保证侧栏、移动端、404 和 favicon 能按尺寸清晰渲染。创作者署名使用独立排版，不作为 Logo 的一部分。

## 技术标识与兼容性

下列标识继续采用 Cyber AI Forge 基线命名：

- 根包名：`cyber-ai-forge`。
- workspace 包作用域：`@cyber-ai-forge/*`。
- 访问令牌键：`cyber_ai_forge_access_token`。
- 标签历史键：`cyber_ai_forge_tag_view_history:v1:<userId>`。
- 语言偏好键：`cyber_ai_forge_locale:v1`。
- JWT issuer：`cyber-ai-forge`。
- JWT audience：`cyber-ai-forge-api`。

它们属于依赖解析、会话安全或本地状态兼容层，不作为 Cyber-Sight 用户界面的产品名称。本次迁移不改变它们，因此不会要求用户重新登录，也不会迁移数据库账号、菜单、授权和业务数据。只有未来存在独立发布或安全迁移理由时，才通过新 ADR 修改这些标识。

## 失败模式与安全考虑

- 产品文案重新声称 Cyber-Sight 就是脚手架：README、关于页和推广站必须区分下游产品与 Cyber AI Forge 工程基线。
- 上游同步覆盖产品品牌：品牌与 README 是 Cyber-Sight 下游拥有文件，冲突时保留下游身份并人工移植上游通用内容。
- 技术标识被误判为遗漏并全量改名：不得在缺少兼容设计时修改 workspace、JWT、浏览器存储或数据库标识。
- Logo 在小尺寸失真：组件保留强轮廓、有限色彩和独立 favicon，并通过生产构建与维护者人工检查验证。
- 品牌迁移不得弱化 JWT 的 issuer/audience 校验，也不得为了名称一致而接受多个签发方。

## 测试与验证策略

- 执行根目录格式化、格式检查、ESLint、TypeScript/生产构建和后端测试。
- 搜索当前代码与现行文档，确认 `Cyber AI Forge` 只保留在工程基线、继承能力、上游同步或技术兼容说明中。
- 维护者人工验收桌面与窄屏登录页、侧栏、404、工作台、favicon、浏览器标题和 Swagger 品牌展示；前端不创建或运行自动化测试。

2026-08-11 实施结果：`pnpm format:check`、`pnpm lint`、`pnpm test` 和 `pnpm build` 均通过，后端共通过 140 项测试；构建产物中的前端标题、推广站中英文 SEO、结构化数据、仓库链接和 Cyber AI Forge 工程归属已完成静态检查。桌面与窄屏视觉、交互和 Swagger 展示仍由维护者人工验收。

## 相关 ADR、计划和 AI 日志

- [Cyber-Sight 下游身份与上游兼容边界](../decisions/ADR-20260811-cyber-sight-downstream-identity.md)
- [Cyber AI Forge 上游同步](upstream-synchronization.md)
- [实施计划](../archive/plans/2026-08-11-cyber-sight-downstream-brand-and-sync.md)
- [AI 协作记录](../archive/ai-logs/2026/08/2026-08-11-cyber-sight-downstream-brand-and-sync.md)
