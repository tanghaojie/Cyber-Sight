---
title: Geo 自动地标周边第一版交付
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-10-04
status: completed
change_type: feat
---

# Geo 自动地标周边第一版交付

## 用户目标和约束

完成上一轮明确的生成器、共享材质、台北街区和 Sight 昼夜适配。全球地标复用，默认影像不改，性能代表最高录屏质量。既有推送与部署授权继续有效。

## 初始证据

Cyber-Sight 起点 f331785，工作区/暂存区为空；归档门禁 NOT_DUE。发现素材仓库 tanghaojie/sample-data，起点 610234e，无 AGENTS，既有地标源文件保持原样。Overture CLI 首次 S3 下载因连接超时失败，继续排查下载通道，不将失败视作数据缺失。

## 方案与执行

外部素材生成与前端显示分离。新增显式场景索引、关联生命周期、生成瓦片昼夜与质量登记。先支持椭球体地面和制作阶段主体排除。

官方 Overture CLI 的 PyArrow S3 连接通过标准 HTTPS 代理适配后成功；该适配已进入通用下载脚本。固定 2026-09-23.1 提取台北 8,627 个建筑/1,760 个分段，纳入 5,821 栋、52 格两级瓦片，排除主体及 31 分段。源数据为 OSM 和 East Asian Buildings，保留 ODbL 数据、CC BY 4.0 署名及配置。

发现并修复 OSM 分段顶部高度重复加 min_height、父塔高度污染未知高度裙楼，以及 float32 屋面极小三角反向问题。生成器含对应几何/高度回归。网格直接导出 GLB，避免 Blender 批处理依赖；共享纹理为原创程序化纹理。

场景工具拥有任务取消、晚返回资源清理、载入坐标选择、失败重试、主体/周边移除与显隐、署名生命周期和姿态/地形校验。复用唯一 Clock、太阳高度、PBR 窗灯与环境；任意第三方瓦片和成都扫描保留原路径。

## 验证结果

七项 Python 生成器回归通过。全部 104 个 GLB 的几何、引用、ENU 变换、包围体和排除验证通过；Khronos 零错误零警告。Sight `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、共享契约构建与 frontend 生产构建通过，包含 vue-tsc；`pnpm docs:archive:check:ci` 为 NOT_DUE，`git diff --check` 通过。构建保留现有 Sass 废弃提示和大包提示；未运行前端/浏览器自动化测试。

素材 master 已发布 `09557564d05b6230544a8ef62375dcb7b43875ee`，Vercel 自动生产部署 `dpl_7JDZtxQpxxSHBCdQxagtEMvuPMzm` 为 READY；场景索引 HTTP 200、JSON 内容有效且 CORS 为 `*`。Sight 改进分支提交后核验预览部署，结果随交付说明提供。关联提交标题：Sight `feat(geo): load generated landmark surroundings`；素材 `feat(geo): generate reusable landmark context and Taipei assets`。不合并现有草稿 PR。

## 未决事项

GPU 与录屏效果由维护者人工验收；真实地形、交通、准确植被与城市反射属于后续。

## 关联

- [设计](../../../../../design/modules/geo-landmark-context.md)
- [计划](../../../../plans/2026-10-04-geo-landmark-context.md)
