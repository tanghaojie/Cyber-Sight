---
title: Geo 已加载模型动画入口与控制面板
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-10-18
updated: 2026-10-18
---

# Geo 已加载模型动画入口与控制面板

## 目标与范围

按维护者要求在外部数据已加载资源的操作区识别动画并显示入口，展开局部播放控制。仅修改 Geo 内部，无发布协议升级，不自动把静态目录项替换成动画文件。

## 前置条件

初始暂存区和工作区为空；Platform 归档审计为 NOT_DUE。遵守现有前端人工验收边界，不运行前端/浏览器自动化。

## 实施任务

- [x] 完成设计、ADR 与协作记录。
- [x] 动画元数据、独立进度、单片段求值与生命周期释放。
- [x] 资源快照/controller 命令、条件按钮及播放面板。
- [x] 完成允许的工程检查与文档收尾，纳入自动提交。

## 验证与回滚

格式、类型、生产构建、修改文件 ESLint、模块边界与归档 CI。人工验收清单见设计。回滚本次功能提交即可恢复原有资源行；没有资产或数据库迁移。

实际已通过 `vue-tsc --noEmit`、frontend build、修改文件 ESLint、`pnpm format`、模块所有权与归档 CI；最终格式及归档 CI 在文档归档后复核。生产构建保留既有 Sass API 弃用、VueUse PURE 注释及包体积提示，未出现编译错误。没有执行前端/浏览器自动化。

## 偏差与遗留

实际浏览器显示与交互待维护者验收。静态目录不自动发现独立动画文件。

## 关联

- [设计](../../design/modules/geo-model-animation.md)
- [ADR](../../decisions/ADR-20261018-model-animation-controls.md)
- [协作记录](../ai-logs/feat/2026/10/2026-10-18-geo-model-animation.md)
