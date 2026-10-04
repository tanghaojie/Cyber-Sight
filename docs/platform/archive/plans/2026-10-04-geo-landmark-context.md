---
title: Geo 自动地标周边第一版
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-10-04
updated: 2026-10-04
---

# Geo 自动地标周边第一版

## 目标与范围

交付外部街区生成器、共享材质、台北 101 静态资产、Sight 场景关联与瓦片昼夜。主要作用域 Platform；外部素材由 sample-data 工程维护。默认影像、主体模型、数据库与后台保持原有职责。

## 实施任务

- [x] 获取实际台北建筑数据，记录来源与可用高度。
- [x] 完成可复用几何/UV/PBR/窗灯/瓦片生成及资产验证。
- [x] 发布台北场景资产与索引。
- [x] 实现场景解析、加载/取消、关联资源及定位/地形校验。
- [x] 实现生成瓦片昼夜和三档质量。
- [x] 完成类型、lint、构建、格式、架构、归档检查，提交推送并检查部署。

## 验证与边界

素材侧执行几何与 GLB/瓦片结构验证。Sight 执行静态门禁，按 AGENTS 不运行前端/浏览器自动化测试；GPU 效果与录屏由维护者人工验收。

## 发布与回滚

素材新目录发布后再发布消费方。Sight 沿用当前改进分支与 PR；取消场景或移除资源可以回退展示，代码回滚使用正常新提交。素材只新增目录，不覆盖已有模型。

## 实际结果

已完成固定版本提取、共享 PBR、两级瓦片、场景解析与独立取消/重试、关联显隐/移除、椭球体及姿态校验、昼夜与三档质量。台北纳入 5,821 栋建筑，52 个空间瓦片/104 个 GLB，保留源数据及配置。

生成器七项回归、全部资产几何/引用/变换检查、Khronos 104 文件零错误零警告通过；Sight 格式、全仓 lint、类型与生产构建、架构检查、归档 CI 门禁通过。未运行前端或浏览器自动化测试，GPU/录屏为人工验收边界。

生成器直接写 glTF，不依赖 Blender；Overture 已含融合 OSM，第一版不叠加独立 OSM 建筑。缺失高度与平顶近似在 metadata 明示；道路、准确植被、真实地形、城市反射留待后续。

素材只新增版本目录；发布通过既有 GitHub 授权和 Vercel Git 集成，部署状态在提交后核验。Sight 沿用现有 PR，不自动合并。关联提交以 `feat(geo): load generated landmark surroundings` 和素材仓库 `feat(geo): generate reusable landmark context and Taipei assets` 为标题。

## 关联

- [设计](../../design/modules/geo-landmark-context.md)
- [决策](../../decisions/ADR-20261004-geo-generated-landmark-context.md)
- [协作记录](../ai-logs/feat/2026/10/2026-10-04-geo-landmark-context.md)
