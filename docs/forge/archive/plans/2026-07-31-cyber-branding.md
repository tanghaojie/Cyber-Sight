---
title: CYBER 框架重品牌实施计划
status: completed
created: 2026-07-31
updated: 2026-07-31
---

# CYBER 框架重品牌实施计划

## 目标

把项目从 JTLab 个人品牌完整迁移为 `CYBER / Cyber Scaffold` 产品品牌，实现确认的连续角形 C Logo，并把 JTLab 降为登录页明确、独立的创作者署名。

## 背景与设计依据

维护者确认 JTLab 不适合作为项目名，并认可第二版 CYBER Logo 方向。实施遵循 [CYBER 品牌与视觉系统](../../design/branding.md)和 [ADR-0028](../../decisions/ADR-0028-product-and-creator-brand-separation.md)。

## 范围

- 前端品牌配置、SVG/Vue Logo、登录页、侧栏、404、工作台、favicon、HTML 元信息和文档标题。
- 后端 Swagger 品牌和 JWT issuer/audience。
- 根包名、认证 cookie、标签历史键及相关现行设计。
- README、设计索引、ADR 索引和协作记录生命周期。

## 非目标

- 不改变业务模块、HTTP 数据契约、数据库 Schema 或菜单数据。
- 不新增前端自动化或浏览器测试。
- 不直接把生成的位图概念稿作为最终运行时 Logo。

## 前置条件和风险

- 任务开始时 `git diff --cached --quiet` 已通过，工作树为空。
- JWT issuer/audience 和 cookie 键切换会使旧会话失效；数据库数据保持不变。
- 前端视觉行为需要维护者在桌面端和窄屏人工验收。

## 实施任务

- [x] 固化品牌设计、ADR、计划和 AI 协作记录。
- [x] 实现可缩放 CYBER Logo 和独立创作者签名。
- [x] 更新登录页、侧栏、404、工作台、favicon 和前端元信息。
- [x] 更新 Swagger、根包名、JWT 和浏览器存储标识。
- [x] 同步 README 与相关现行设计，清理旧品牌残留。
- [x] 完成格式、静态检查、构建、后端测试和文档检查。
- [x] 归档计划与 AI 日志，更新索引并创建带 AI trailer 的提交。

## 测试与验证

- `pnpm format`：通过。
- `pnpm format:check`：通过。
- `pnpm lint`：通过。
- `pnpm build`：共享契约、后端和前端生产构建通过；沙箱内首次运行因 Vite/esbuild 无权读取父目录失败，使用相同命令在授权环境通过。保留既有 Sass legacy API 和静态/动态重复导入提示。
- `pnpm test`：11 个后端测试文件、100 个测试全部通过，包含新增的 CYBER JWT issuer/audience 断言；沙箱内首次运行同样因 Vitest 配置读取限制失败，授权环境通过。
- 旧品牌搜索：产品层旧文案无残留；JTLab 只保留在创作者署名和兼容性说明，`jtlib_access_token` 只保留在旧 cookie 清理逻辑。
- Markdown 相对链接：`MARKDOWN_BROKEN=0`。
- `git diff --check`：通过。
- 前端未创建或运行自动化/浏览器测试；桌面和窄屏视觉、登录交互、favicon 与 Swagger 展示由维护者人工验收。

## 发布与回滚

本次以 `feat: rebrand scaffold as CYBER` 提交交付。回滚该提交可恢复旧品牌；升级后已有浏览器会话需要重新登录，标签历史从新的存储键重新建立。

## 实际偏差和遗留问题

- 生成的位图概念稿只用于确定方向，最终运行时使用仓库内可维护 SVG/Vue 组件，符合设计方案。
- 验证前 pnpm 在沙箱内重建 `node_modules` 链接时被中断；随后以锁文件和本地缓存完成离线恢复，675 个包全部复用、0 下载，锁文件未变化。
- 没有功能实现偏差。前端视觉与交互的人工验收仍由维护者完成。

## 相关设计、ADR 和 AI 日志

- [CYBER 品牌与视觉系统](../../design/branding.md)
- [ADR-0028](../../decisions/ADR-0028-product-and-creator-brand-separation.md)
- [AI 协作记录](../ai-logs/2026/07/2026-07-31-cyber-branding.md)
