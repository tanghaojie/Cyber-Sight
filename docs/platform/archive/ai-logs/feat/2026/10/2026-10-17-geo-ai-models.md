---
title: AIModels 发布协议与 Geo 模型目录接入
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-10-17
status: completed
change_type: feat
---

# AIModels 发布协议与 Geo 模型目录接入

## 用户目标和约束

维护者要求按已确认设计完成 AIModels 与 Cyber-Sight 改造并推送。新增 AI 模型类型，自动发现发布模型，点击加载主体和配套资源；三个 URL 入口保留，不恢复地标与周边入口。

## 方案与执行

采用版本化静态目录及每模型描述，延续模型/附件/工具分类；数据组装留在 Geo 工具层。原始 placement、scene 文件保留，新增描述统一字段和当前 AIModels 相对路径。无新增后端和数据库，前端交互由维护者人工验收。

## 验证及未决事项

暂存区门禁、工作区、远端方向及归档审计已检查。AIModels 已完成静态发布并推送：d9ff258 为功能，37692bd 修复跨平台路径排序。7 项发布工具检查和 Ubuntu CI 38998039897 通过。线上 Vercel READY，9 个发布 JSON 一致、10 个模型/质量版本完整 SHA-256 与字节数一致、131 个配套瓦片/纹理/预览端点 HTTP 200 与 CORS 通过。详细资源证据保存在 AIModels/docs/verification/2026-10-17-catalog.json。

Geo 交付同源版本校验、目录读取与刷新、模型搜索/预览/质量选择、显式发布坐标、主模型与关联资源组、取消和卸载回收、必需失败回滚/可选失败说明、重复加载定位、组显隐/移除及地形保护。普通三种 URL 输入和坐标询问保持原语义。TypeScript/生产构建、修改文件 ESLint、pnpm format、pnpm format:check、architecture:check、归档 CI（NOT_DUE）和 diff 核对通过。构建有既有 Sass、第三方 PURE 注释和大 chunk 提示。

按 AGENTS.md 不创建或运行前端自动化/浏览器测试。实际画面、昼夜、定位、取消和组操作仍需维护者人工验收。推送结果及最终远端 SHA 在交付反馈核对；本记录随 feat(geo): load published AIModels library 提交。

## 关联

- [设计](../../../../../design/modules/geo-ai-models.md)
- [计划](../../../../plans/2026-10-17-geo-ai-models.md)
