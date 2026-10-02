---
title: Geo 第一轮显示优化与模型坐标选择
scope: platform
repository: Cyber-Sight
status: completed
owner: project maintainers
date: 2026-10-02
---

# 实施计划

## 授权与目标

维护者授权三档性能/平衡/兼容；性能提供最高显示效果，兼容关闭多数特效。GLB有效内置坐标必须询问使用内置或输入坐标。默认影像不改变，其余按现实感方案完成第一轮。

## 阶段

- [x] 暂存区为空、工作区为空，archive审计NOT_DUE；审阅Geo边界与现行ADR。
- [x] 编写设计、计划、协作记录与新ADR。
- [x] 实现Scene模式与质量生命周期、近地光照、阴影、后期与模型夜景。
- [x] 实现独立GLB准备、发光倍率、坐标选择与地形高度。
- [x] 改进模型自动构图与默认加载镜头竞争。
- [x] 完成静态门禁、diff审阅及文档归档；与代码同提交并附AI标记。

## 验证

已通过 `pnpm format`、`pnpm format:check`、`pnpm exec eslint apps/frontend/src/platform/modules/geo`、`pnpm architecture:check`、`pnpm --filter @cyber-ai-forge/frontend build`（包含Vue/TS及Sight/Standalone双入口）、`pnpm docs:archive:check:ci`（NOT_DUE）和diff检查。前端视觉与浏览器交互由维护者人工验收，没有新增或运行前端/浏览器自动化测试。

## 交付记录

完成三档场景预设、固定/自适应分辨率、近地光照、软阴影、受控柔光、夜间IBL与发光倍率适配、GLB坐标询问和取消、按当前地形定位、自动构图及启动镜头保护。有效坐标对话框使用独立overlay，不随数据面板切换卸载。

初轮Vue类型检查发现Blob typed-array、可选球谐setter和可选视场角类型不匹配，修正后类型与生产构建通过。复核中使兼容档FPS阈值匹配30 FPS上限，保护无效相机/时间不终止渲染。当前构建仍有原有Sass弃用及大包提示，不新增依赖或改变打包策略。

未改变默认影像、Clock与时区、扫描材质或源资产。当前glTF2.0加载器只解释明确WGS84 metadata，不猜测任意坐标标准。当前地形是椭球时定位高度为0；真实地形采样失败或变更会要求重试。环境图时间预算不是完成时限，轻量环境补光与柔光不是物理城市照明。无UV/贴图和二维影像的立面/固定照片阴影局限仍在。

人工验收重点：加载给定台北101模型后两种坐标与取消；切换面板仍显示询问；模式切换、暂停跳时、3600倍播放、横屏构图、移除/退出、低配降级及GPU视觉。后续街区/资产重制、语义窗灯、环绕、双环境图插值及离线导出未实现。

关联提交：本记录与 `feat(geo): add rendering modes and model coordinate selection` 代码提交一同交付；带真实模型GPT-6的AI trailer。
