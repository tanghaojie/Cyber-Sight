# Platform 历史归档

- [Platform 归档审查台账](archive-ledger.json)：当前业务平台最近一次完成审查的 Git 基线；下游独立推进。

历史决策见[决策归档索引](decisions/README.md)。

## 已归档设计

- [Cyber-Sight 推广站设计](design/marketing-site.md)：因下游删除推广站应用和 GitHub Pages 工作流，不再作为当前实现。

## 已完成计划

- [2026-08-31 Geo 可收起状态栏与时间轴底部自适应](plans/2026-08-31-geo-collapsible-status-bar.md)：状态栏收起后只保留展开按钮，时间轴同步下沉并避让按钮。
- [2026-08-30 Geo 时间轴与太阳光照](plans/2026-08-30-geo-time-and-solar-lighting.md)：以唯一 `viewer.clock` 实现 UTC 时间轴、太阳光照和独立阴影开关。
- [2026-08-07 关于项目页面](plans/2026-08-07-about-project.md)
- [2026-08-10 独立静态官网](plans/2026-08-10-marketing-site.md)、[视觉优化](plans/2026-08-10-marketing-site-visual-refinement.md)、[SEO 增强](plans/2026-08-10-website-seo.md)与[归档审查](plans/2026-08-10-marketing-site-follow-up-archive-review.md)
- [2026-08-10 官网特性语言切换显现修复](plans/2026-08-10-feature-locale-reveal.md)
- [2026-08-11 前端品牌文字配置归档审查](plans/2026-08-11-frontend-brand-text-config-archive-review.md)与[实施](plans/2026-08-11-frontend-brand-text-config.md)
- [2026-08-11 Cyber-Sight 下游品牌与同步](plans/2026-08-11-cyber-sight-downstream-brand-and-sync.md)：建立下游品牌和上游同步边界。
- [2026-08-11 Cyber-Sight 上游归档审查](plans/2026-08-11-cyber-sight-upstream-archive-review.md)：完成历史文档归档审查。
- [2026-08-12 Platform 环境变量配置收敛](plans/2026-08-12-runtime-configuration.md)：把品牌元数据、Swagger 元数据和 JWT identity 收敛到环境变量入口。
- [2026-08-13 Forge 架构更新接入 Cyber-Sight](plans/2026-08-13-forge-architecture-sync.md)：完成 Foundation 同步、Platform 文档迁移和下游边界固化。
- [2026-08-14 清理已移除推广站引用](plans/2026-08-14-remove-retired-marketing-site-references.md)：清理 README、同步清单、部署配置和当前文档中的失效引用。
- [2026-08-14 Geo 前端工作台](plans/2026-08-14-geo-frontend-workspace.md)：完成纯前端 Cesium 工作台、编译期插件和通用 Geo 能力迁移。
- [2026-08-17 Geo 文档归档审查](plans/2026-08-17-geo-documentation-archive-review.md)：完成旧归档门禁接续并迁移到分域审计。
- [2026-08-20 Forge 上游同步](plans/2026-08-20-forge-upstream-sync.md)：合并 Forge `70dbfbd` 并建立 Cyber-Sight Platform 审计基线。
- [2026-08-20 Geo 底图目录交互与默认加载修复](plans/2026-08-20-geo-imagery-ui-and-loading.md)：修复底图目录扩展性、不可用源提示和远程候选默认加载导致的失败请求。
- [2026-08-20 Geo 底图文档归档复核](plans/2026-08-20-geo-documentation-archive-review.md)：复核 Geo 交付后的 Platform 文档一致性并推进归档台账。
- [2026-08-29 Geo 渲染性能优化](plans/2026-08-29-geo-rendering-performance.md)：完成自适应渲染比例、空闲显式渲染、拾取节流与本地端口调整。
- [2026-08-29 Geo 外壳精简与指南针交互修复](plans/2026-08-29-geo-shell-and-compass.md)：删除重复顶栏，让指南针反映真实 heading 并支持点击回正。
- [2026-08-29 Geo 近期交付后的 Platform 文档归档审查](plans/2026-08-29-platform-documentation-archive-review.md)：复核渲染性能与外壳/指南针交付并推进 Platform 台账。
- [2026-08-29 Geo 视图、地形与测量状态修复](plans/2026-08-29-geo-behavior-corrections.md)：让面板和结果持续表达 Viewer 的真实状态。
- [2026-08-29 Geo 等高线交互修复](plans/2026-08-29-geo-contour-interaction.md)：移除等高线坐标输入，按真实地形状态提供可用性提示和材质交互。
- [2026-08-29 Geo 行为修复后的 Platform 文档归档审查](plans/2026-08-29-platform-documentation-archive-review-2.md)：复核状态同步与等高线交付并推进 Platform 台账。
- [2026-08-29 Geo 外部模型放置与定位闭环](plans/2026-08-29-geo-model-placement.md)：支持外部 glTF/GLB 的初始放置、会话变换编辑和模型定位。
- [2026-08-30 Geo 地形剖面采样修复](plans/2026-08-30-geo-terrain-profile.md)：接通地图画线、沿线高程采样与剖面展示工作流。
- [2026-08-30 Geo 近期交付后的 Platform 文档归档审查](plans/2026-08-30-platform-documentation-archive-review.md)：复核模型放置与地形剖面交付并推进 Platform 台账。
- [2026-08-30 Geo 对比会话状态修复](plans/2026-08-30-geo-compare-session-state.md)：修复虚假启用状态，并让暂停分屏保持影像可见。
- [2026-08-30 Geo 地形与对比状态一致性修复](plans/2026-08-30-geo-terrain-and-compare-consistency.md)：实现地形最新请求生效，并让对比会话跟踪稳定影像图层生命周期。
- [2026-08-30 Geo 状态一致性交付后的 Platform 文档归档审查](plans/2026-08-30-platform-documentation-archive-review-2.md)：复核对比会话与地形状态一致性交付并推进 Platform 台账。
- [2026-08-30 Geo 影像兜底与瓦片状态恢复](plans/2026-08-30-geo-imagery-fallback-and-recovery.md)：始终保留 Natural Earth 本地兜底，并让瞬时瓦片错误可从真实成功请求恢复。
- [2026-08-30 Geo 横向宽屏布局收敛](plans/2026-08-30-geo-wide-screen-only.md)：冻结横向 `1280×720` 最低支持基线并移除窄屏响应式布局。
- [2026-08-30 Geo 影像与宽屏交付后的 Platform 文档归档审查](plans/2026-08-30-platform-documentation-archive-review-3.md)：复核影像恢复与宽屏交付并推进 Platform 台账。

## AI 协作记录

- [2026-08-31 Geo 可收起状态栏与时间轴底部自适应](ai-logs/2026/08/2026-08-31-geo-collapsible-status-bar.md)
- [2026-08-30 Geo 时间轴与太阳光照](ai-logs/2026/08/2026-08-30-geo-time-and-solar-lighting.md)
- [2026-08-07 关于项目页面](ai-logs/2026/08/2026-08-07-about-project.md)
- [2026-08-10 独立静态官网](ai-logs/2026/08/2026-08-10-marketing-site.md)、[视觉优化](ai-logs/2026/08/2026-08-10-marketing-site-visual-refinement.md)、[SEO 增强](ai-logs/2026/08/2026-08-10-website-seo.md)与[语言切换显现修复](ai-logs/2026/08/2026-08-10-feature-locale-reveal.md)
- [2026-08-11 前端品牌文字配置归档审查](ai-logs/2026/08/2026-08-11-frontend-brand-text-config-archive-review.md)与[实施](ai-logs/2026/08/2026-08-11-frontend-brand-text-config.md)
- [2026-08-11 Cyber-Sight 下游品牌与同步](ai-logs/2026/08/2026-08-11-cyber-sight-downstream-brand-and-sync.md)
- [2026-08-11 Cyber-Sight 上游归档审查](ai-logs/2026/08/2026-08-11-cyber-sight-upstream-archive-review.md)
- [2026-08-12 Platform 环境变量配置收敛](ai-logs/2026/08/2026-08-12-runtime-configuration.md)
- [2026-08-13 Forge 架构更新接入 Cyber-Sight](ai-logs/2026/08/2026-08-13-forge-architecture-sync.md)
- [2026-08-14 清理已移除推广站引用](ai-logs/2026/08/2026-08-14-remove-retired-marketing-site-references.md)
- [2026-08-14 Geo 模块设计与实施](ai-logs/2026/08/2026-08-14-geo-platform-design.md)
- [2026-08-17 Geo 文档归档审查](ai-logs/2026/08/2026-08-17-geo-documentation-archive-review.md)
- [2026-08-20 Forge 上游同步](ai-logs/2026/08/2026-08-20-forge-upstream-sync.md)
- [2026-08-20 Geo 底图目录交互与默认加载修复](ai-logs/2026/08/2026-08-20-geo-imagery-ui-and-loading.md)
- [2026-08-20 Geo 底图文档归档复核](ai-logs/2026/08/2026-08-20-geo-documentation-archive-review.md)
- [2026-08-29 Geo 渲染性能优化](ai-logs/2026/08/2026-08-29-geo-rendering-performance.md)
- [2026-08-29 Geo 外壳精简与指南针交互修复](ai-logs/2026/08/2026-08-29-geo-shell-and-compass.md)
- [2026-08-29 Geo 近期交付后的 Platform 文档归档审查](ai-logs/2026/08/2026-08-29-platform-documentation-archive-review.md)
- [2026-08-29 Geo 视图、地形与测量状态修复](ai-logs/2026/08/2026-08-29-geo-behavior-corrections.md)
- [2026-08-29 Geo 等高线交互修复](ai-logs/2026/08/2026-08-29-geo-contour-interaction.md)
- [2026-08-29 Geo 行为修复后的 Platform 文档归档审查](ai-logs/2026/08/2026-08-29-platform-documentation-archive-review-2.md)
- [2026-08-29 Geo 外部模型放置与定位闭环](ai-logs/2026/08/2026-08-29-geo-model-placement.md)
- [2026-08-30 Geo 地形剖面采样修复](ai-logs/2026/08/2026-08-30-geo-terrain-profile.md)
- [2026-08-30 Geo 近期交付后的 Platform 文档归档审查](ai-logs/2026/08/2026-08-30-platform-documentation-archive-review.md)
- [2026-08-30 Geo 对比会话状态修复](ai-logs/2026/08/2026-08-30-geo-compare-session-state.md)
- [2026-08-30 Geo 地形与对比状态一致性修复](ai-logs/2026/08/2026-08-30-geo-terrain-and-compare-consistency.md)
- [2026-08-30 Geo 状态一致性交付后的 Platform 文档归档审查](ai-logs/2026/08/2026-08-30-platform-documentation-archive-review-2.md)
- [2026-08-30 Geo 影像兜底与瓦片状态恢复](ai-logs/2026/08/2026-08-30-geo-imagery-fallback-and-recovery.md)
- [2026-08-30 Geo 横向宽屏布局收敛](ai-logs/2026/08/2026-08-30-geo-wide-screen-only.md)
- [2026-08-30 Geo 影像与宽屏交付后的 Platform 文档归档审查](ai-logs/2026/08/2026-08-30-platform-documentation-archive-review-3.md)

Sight 等业务平台在自己的仓库维护本目录。
