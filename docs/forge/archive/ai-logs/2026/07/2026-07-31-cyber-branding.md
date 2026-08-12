---
title: CYBER 框架重品牌
date: 2026-07-31
status: completed
---

# CYBER 框架重品牌

## 用户目标和约束

- JTLab / 桀士实验室是维护者个人品牌，不应继续作为项目名。
- 项目采用 `CYBER`，兼具 AI cyber 与 cyberpunk 联想。
- 维护者认可第二版连续角形 C Logo，并要求据此实施整个框架修改。
- JTLab 只能作为合适位置的个人品牌署名，不能让用户误认为是框架内容。

## 关键问答与确认

- 首版四角标志与 `A JTLab Project` 被否定，原因是含义不清、设计感和高级科技感不足。
- 第二版连续双层 C、精密开口和数据节点方向获得确认。
- 最终实施把创作者署名与产品 Logo 完全分离，登录页使用明确的 `CREATED BY` 标签。

## AI 的重要假设

- “整个框架”包含用户可见品牌、README、Swagger、根包名以及品牌化的 cookie、标签历史和 JWT 元数据。
- 旧会话可以在本次品牌切换后失效并要求重新登录；不迁移或删除数据库数据。
- 生成位图只作为方向稿，运行时资产应以可维护 SVG/Vue 组件实现。

## 方案和执行摘要

- 新增 CYBER 品牌设计与 ADR-0028，明确产品、创作者和白标边界。
- 新增连续双层 C 的 `CyberLogo.vue`、独立 `CreatorCredit.vue` 和 SVG favicon。
- 重构登录页品牌氛围，更新侧栏、404、工作台、浏览器标题和元信息。
- 更新 Swagger、根包名、访问令牌键、标签历史键和 JWT issuer/audience，并补充 JWT claim 测试。
- 同步 README、系统概览以及前端、认证、标签历史现行设计。

## 验证结果

- 格式化、格式检查和 ESLint 通过。
- 授权环境中的完整生产构建通过；沙箱内失败仅为已知 Vite/esbuild 父目录访问限制。
- 11 个后端测试文件、100 个测试全部通过；共享契约分发验证通过。
- 旧产品品牌残留、Markdown 相对链接和 `git diff --check` 检查通过。
- pnpm 依赖链接使用锁文件和本地缓存恢复，0 下载且锁文件未变化。

## 未决问题与下一步

维护者人工验收桌面/窄屏登录页、侧栏、404、工作台、favicon、浏览器标题和 Swagger 品牌展示。前端按项目边界未创建或运行自动化测试。

## 相关设计、ADR、计划和提交

- [CYBER 品牌与视觉系统](../../../design/branding.md)
- [ADR-0028](../../../decisions/ADR-0028-product-and-creator-brand-separation.md)
- [实施计划](../../../archive/plans/2026-07-31-cyber-branding.md)
- 提交：`feat: rebrand scaffold as CYBER`
