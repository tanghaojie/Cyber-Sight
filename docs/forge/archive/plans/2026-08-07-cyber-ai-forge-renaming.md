---
title: Cyber AI Forge 品牌与项目标识改名
status: completed
created: 2026-08-07
updated: 2026-08-07
---

# Cyber AI Forge 品牌与项目标识改名

## 目标

将项目统一改名为 `Cyber AI Forge`，并在中英文界面、README、Swagger、HTML 元信息、环境变量示例、包元数据和项目设计文档中使用以下定位：

- 英文副标题：`AI-Native Enterprise Application Scaffold`
- 中文副标题：`AI 驱动的企业应用智能构建平台`

## 背景与设计依据

现行品牌设计使用 `Cyber Scaffold`，但用户已确认产品名称和定位升级为面向企业应用的 AI 原生智能构建平台。本次沿用 `CYBER` 短品牌和 JTLab 独立创作者署名，更新正式名称、默认文案和项目级技术标识。依据：[CYBER 品牌与视觉系统](../../design/branding.md)、[前端应用与应用壳](../../design/modules/frontend.md)、[认证模块](../../design/modules/auth.md)。

## 范围

- 前端登录页、工作台、关于页、共享 GitHub 文案、浏览器标题、描述和 favicon 标题。
- README、Swagger 描述、环境变量示例和现行设计/ADR 索引。
- 根包名和认证、语言、标签历史的项目级标识。
- 清理旧访问令牌键，避免旧品牌会话继续混用。

## 非目标

- 不修改 GitHub 仓库 URL、数据库表、API 路由、业务数据或模块边界。
- 不移除 JTLab / 桀士实验室署名；它仍只作为创作者品牌出现。
- 不创建或运行前端自动化测试；浏览器行为由维护者人工验收。

## 前置条件和风险

- JWT issuer/audience 和访问令牌键切换后，已有浏览器会话需要重新登录。
- 新标签历史和语言偏好从新的版本化键开始；旧本地数据不迁移。
- 环境变量覆盖仍可用于白标部署，部署者必须同时替换 Logo 和 favicon。

## 实施任务

- [x] 建立并更新品牌设计、ADR、AI 协作记录。
- [x] 更新前端默认配置、固定双语文案、HTML 元信息和 SVG 标题。
- [x] 更新 README、Swagger、根包元数据和认证/浏览器存储技术标识。
- [x] 更新现行设计文档、索引和验证记录。
- [x] 执行格式化、格式检查、Lint、类型检查、构建、后端测试和残留搜索。
- [x] 归档完成计划与 AI 协作记录，并创建带真实模型 trailer 的 Git 提交。

## 测试与验证

- `pnpm format`
- `pnpm format:check`
- `pnpm lint`
- `pnpm build`
- `pnpm test`
- 搜索当前代码和现行文档，确认旧产品品牌和旧项目级标识只保留在兼容性说明中。
- 维护者人工验收登录页、工作台、关于页、侧栏、404、favicon、浏览器标题、语言切换和 Swagger。

## 发布与回滚

发布前确认 GitHub URL 仍指向实际仓库。若需要回滚，恢复本次提交即可；数据库无需回滚，旧浏览器会话只能重新登录或由回滚版本重新读取旧键。

## 实际偏差和遗留问题

已完成。未修改 GitHub URL、内部 `@scaffold/*` 作用域、数据库、API 路由或业务数据；构建保留仓库既有 Sass legacy API、依赖注释和静态/动态导入提示。浏览器验收仍由维护者完成。

关联提交：`chore: rename project to Cyber AI Forge`

## 相关设计、ADR 和 AI 日志

- [CYBER 品牌与视觉系统](../../design/branding.md)
- [ADR-0031：Cyber AI Forge 品牌与项目级技术标识](../../decisions/ADR-0031-cyber-ai-forge-brand.md)
- [AI 协作记录](../ai-logs/2026/08/2026-08-07-cyber-ai-forge-renaming.md)
