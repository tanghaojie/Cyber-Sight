---
title: Geo 影像兜底与瓦片状态恢复
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-30
updated: 2026-08-30
---

# Geo 影像兜底与瓦片状态恢复

## 目标

修复配置天地图后远程瓦片失败导致首屏失去本地底图，以及单次瓦片错误永久污染图层状态的问题。

## 背景与设计依据

严格对抗性审查的问题 1 和问题 4 指向同一影像可靠性边界：当前启动流程在有令牌时不加载 Natural Earth，图层管理器又把任意 provider 错误永久写为 `failed`。现行 ADR 已明确瓦片错误不等于服务永久不可用。

## 范围

- 始终先加载 Natural Earth，再按配置叠加天地图影像和注记；
- 图层状态使用可恢复的 `degraded`，保留最近瓦片错误；
- 观察 provider 的真实瓦片请求成功并恢复 `ready`；
- 同步数据面板、Geo Design、ADR、计划和 AI 记录。

## 非目标

- 不新增服务端代理、健康检查接口或额外探测请求；
- 不自动重试、替换用户主动选择的远程候选源；
- 不修复审查问题 5、6 或其他 Geo 功能；
- 不新增或运行前端自动化浏览器测试。

## 前置条件和风险

- Natural Earth 保持在远程默认底图下方，正常远程瓦片会自然遮盖本地层；
- 只有真实瓦片请求成功才清除降级状态，固定超时不能作为恢复证据；
- 用户主动隐藏或移除 Natural Earth 后，不再保证本地视觉兜底。

## 实施任务

- [x] 调整数据插件默认影像加载顺序；
- [x] 实现 provider 瓦片成功观察和可恢复状态；
- [x] 更新数据面板状态文案与视觉；
- [x] 完成适用静态验证；
- [x] 归档计划与 AI 记录并创建带 AI trailer 的提交。

## 测试与验证

- `pnpm --filter @cyber-ai-forge/frontend build`
- `pnpm lint`
- `pnpm format:check`
- `pnpm architecture:check`
- `pnpm docs:archive:check:ci`
- `git diff --check`
- 人工边界：配置有效/无效天地图令牌、短暂断网后恢复、持续断网以及主动移除兜底层。

## 发布与回滚

改动仅影响当前页面会话内影像加载顺序和状态展示，不涉及持久数据或迁移；回滚对应提交即可恢复旧行为。

## 实际偏差和遗留问题

实现与计划一致，无范围偏差。生产构建在受限环境因 Windows/esbuild 目录访问权限失败后，在授权环境以相同命令通过；保留仓库既有 Sass legacy API、VueUse 注解和 Geo 大 chunk 警告。前端未创建或运行自动化测试，配置有效/无效天地图令牌、短暂或持续断网以及主动移除兜底层仍需维护者人工浏览器验收。

## 相关设计、ADR 和 AI 日志

- [Geo 前端空间可视化工作台](../../design/modules/geo.md)
- [Geo 影像默认源与失败隔离](../../decisions/ADR-20260820-geo-imagery-defaults.md)
- [AI 协作记录](../ai-logs/2026/08/2026-08-30-geo-imagery-fallback-and-recovery.md)
