# Platform 历史归档

- [Platform 归档审查台账](archive-ledger.json)：当前业务平台最近一次完成审查的 Git 基线；下游独立推进。

历史决策见[决策归档索引](decisions/README.md)。

## 已归档设计

- [Cyber-Sight 推广站设计](design/marketing-site.md)：因下游删除推广站应用和 GitHub Pages 工作流，不再作为当前实现。

## 已完成计划

- [2026-09-01 Geo 第二个构建入口后的 Platform 文档归档审查](plans/2026-09-01-platform-documentation-archive-review-2.md)：复核双入口构建及基线后的 Geo 交付，并将 Platform ledger 推进到 `2910f7d`。
- [2026-09-01 Geo 第二个构建入口](plans/2026-09-01-geo-second-build-entry.md)：在一次 frontend 多入口构建中同时输出 Sight 和 Standalone Geo，并共享唯一 Cesium 静态目录。
- [2026-09-01 Geo 默认相机与底部工作台启动状态](plans/2026-09-01-geo-default-camera-and-bottom-dock-state.md)：统一启动成都近景相机预置，并让状态条与时间轴默认收起。
- [2026-09-01 Geo 赛博城市交付后的 Platform 文档归档审查](plans/2026-09-01-geo-cyber-city-platform-documentation-archive-review.md)：复核上一基线后的 Geo 交付，并将 Platform ledger 推进到 `f1c030b`。
- [2026-09-01 Geo 默认外部数据与赛博城市渲染](plans/2026-09-01-geo-cyber-city-preset.md)：默认加载成都建筑 3D Tiles，提供程序化科技扫描材质、原始材质切换与 30 km 高空自动隐藏。
- [2026-09-01 Geo 外部 glTF 加载状态与自动定位修复](plans/2026-09-01-geo-model-loading.md)：增加模型 loading 反馈，等待 Cesium Model ready 后自动定位并保护包围球读取。
- [2026-09-01 Geo 航班调整后的 Platform 文档归档审查](plans/2026-09-01-platform-documentation-archive-review.md)：复核航班视图与播放联动交付，并将 Platform ledger 推进到 `4434975`。
- [2026-09-01 Geo 航班视图、航线与播放联动](plans/2026-09-01-geo-flight-visualization-and-playback.md)：开启航班后自动播放和全航线取景，新增 30 条三维多色模拟航线与仅显示飞机的控制。
- [2026-08-31 Geo 无界时间轴与每日循环航线](plans/2026-08-31-geo-unbounded-timeline-and-daily-flight-cycle.md)：将时间轴升级为无界 UTC 可见窗口，并让模拟航班按每日 UTC 航段循环。
- [2026-08-31 Geo 底部工作台折叠交互](plans/2026-08-31-geo-bottom-workbench.md)：将状态条与时间轴合并为连续底部工作台，并让两者可独立收起。
- [2026-08-31 Geo 飞机显示修复后的 Platform 文档归档审查](plans/2026-08-31-platform-documentation-archive-review-7.md)：复核 Canvas 图标、尺寸航向与单航线修复，并将 Platform ledger 推进到 `38c1737`。
- [2026-08-31 Geo 模拟飞机尺寸航向与单航线](plans/2026-08-31-geo-flight-icon-scale-heading-and-route.md)：放大飞机、按可见前进方向旋转机头，并删除动态短轨迹。
- [2026-08-31 Geo 模拟飞机透明 Canvas 图标](plans/2026-08-31-geo-aircraft-canvas-icon.md)：以透明 Canvas 飞机轮廓替代 Cesium 黑色 SVG 占位。
- [2026-08-31 Geo 航班修复后的 Platform 文档归档审查](plans/2026-08-31-platform-documentation-archive-review-6.md)：复核离线模拟航班、完整航线与本地 SVG 图标，并将 Platform ledger 推进到 `2595da9`。
- [2026-08-31 Geo 模拟飞机本地 SVG 图标](plans/2026-08-31-geo-aircraft-icon-asset.md)：以 Vite `public` 静态 SVG 替代未加载的内联 data URI。
- [2026-08-31 Geo 模拟航线完整连线与飞机图标](plans/2026-08-31-geo-flight-route-and-icon.md)：每条模拟航线完整连接起终点，活动航空器由内置飞机图标表示。
- [2026-08-31 Geo 前端模拟航班](plans/2026-08-31-geo-simulated-flights.md)：删除实时数据和后端 Geo 模块，改用唯一时间轴驱动的离线模拟航线。
- [2026-08-31 Geo 时间轴响应性修复后的 Platform 文档归档审查](plans/2026-08-31-platform-documentation-archive-review-5.md)：复核 Geo 修复记录并将 Platform ledger 推进到时间轴响应性修复提交。
- [2026-08-31 Geo 时间轴插件贡献响应性修复](plans/2026-08-31-geo-timeline-reactivity.md)：让异步发布的时间轴贡献重新触发工作台渲染。
- [2026-08-31 Geo 2D 场景过渡相机状态修复](plans/2026-08-31-geo-2d-morph-camera-status.md)：让 2D/3D 过渡帧安全表达相机姿态，不再中断 Cesium 渲染。
- [2026-08-31 Geo Google 默认底图提交后的 Platform 文档归档审查](plans/2026-08-31-platform-documentation-archive-review-4.md)：以默认底图实现提交为新 Platform 审计基线。
- [2026-08-31 Geo 默认底图调整后的 Platform 文档归档审查](plans/2026-08-31-platform-documentation-archive-review-3.md)：复核 Google · 混合默认底图决策并推进 Platform 台账。
- [2026-08-31 Geo Google 混合默认底图](plans/2026-08-31-geo-google-hybrid-default.md)：启动时仅加载 Google · 混合底图，其他影像源改为用户主动添加。
- [2026-08-31 Geo 人工验收修复后的 Platform 文档归档审查](plans/2026-08-31-platform-documentation-archive-review-2.md)：复核 Geo 人工验收修复并推进 Platform 台账。
- [2026-08-31 Geo 工作台与地形人工验收问题修复](plans/2026-08-31-geo-workbench-terrain-acceptance-fixes.md)：修复底部 dock 避让、可调整面板、地形切换反馈、着色、交互淹没与剖面线清除。
- [2026-08-31 Geo OpenSky 实时航线展示](plans/2026-08-31-geo-opensky-live-flights.md)：通过无存储后端代理和默认关闭的 Flight 插件展示当前视域航空器及会话短轨迹。
- [2026-08-31 Geo 时间与状态栏交付后的 Platform 文档归档审查](plans/2026-08-31-platform-documentation-archive-review.md)：复核时间轴、太阳光照和可收起状态栏交付并推进 Platform 台账。
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
- [2026-08-20 Geo 数据面板与地图交互精简](plans/2026-08-20-geo-panel-interaction-refinement.md)：精简底图/图层面板、补充高德开关、对比真实图层名和地图光标交互。
- [2026-08-20 Geo 前端交互完善](plans/2026-08-20-geo-frontend-interaction-completion.md)：完成 Google 默认源、坐标校正、地图工具和测量历史交互。
- [2026-08-20 Geo 前端交互完善后的 Platform 文档归档复核](plans/2026-08-20-geo-frontend-interaction-archive-review.md)：复核本轮 Geo 交付后的 Platform 文档一致性并推进归档台账。
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

- [2026-09-01 Geo 第二个构建入口后的 Platform 文档归档审查](ai-logs/2026/09/2026-09-01-platform-documentation-archive-review-2.md)
- [2026-09-01 Geo 第二个构建入口](ai-logs/2026/09/2026-09-01-geo-second-build-entry.md)
- [2026-09-01 Geo 默认相机与底部工作台启动状态](ai-logs/2026/09/2026-09-01-geo-default-camera-and-bottom-dock-state.md)
- [2026-09-01 Geo 赛博城市交付后的 Platform 文档归档审查](ai-logs/2026/09/2026-09-01-geo-cyber-city-platform-documentation-archive-review.md)
- [2026-09-01 Geo 默认外部数据与赛博城市渲染](ai-logs/2026/09/2026-09-01-geo-cyber-city-preset.md)
- [2026-09-01 Geo 外部 glTF 加载状态与自动定位修复](ai-logs/2026/09/2026-09-01-geo-model-loading.md)
- [2026-09-01 Geo 航班调整后的 Platform 文档归档审查](ai-logs/2026/09/2026-09-01-platform-documentation-archive-review.md)
- [2026-09-01 Geo 航班视图、航线与播放联动](ai-logs/2026/09/2026-09-01-geo-flight-visualization-and-playback.md)
- [2026-08-31 Geo 底部工作台折叠交互](ai-logs/2026/08/2026-08-31-geo-bottom-workbench.md)
- [2026-08-31 Geo 飞机显示修复后的 Platform 文档归档审查](ai-logs/2026/08/2026-08-31-platform-documentation-archive-review-7.md)
- [2026-08-31 Geo 模拟飞机尺寸航向与单航线](ai-logs/2026/08/2026-08-31-geo-flight-icon-scale-heading-and-route.md)
- [2026-08-31 Geo 模拟飞机透明 Canvas 图标](ai-logs/2026/08/2026-08-31-geo-aircraft-canvas-icon.md)
- [2026-08-31 Geo 航班修复后的 Platform 文档归档审查](ai-logs/2026/08/2026-08-31-platform-documentation-archive-review-6.md)
- [2026-08-31 Geo 模拟飞机本地 SVG 图标](ai-logs/2026/08/2026-08-31-geo-aircraft-icon-asset.md)
- [2026-08-31 Geo 模拟航线完整连线与飞机图标](ai-logs/2026/08/2026-08-31-geo-flight-route-and-icon.md)
- [2026-08-31 Geo 无界时间轴与每日循环航线](ai-logs/2026/08/2026-08-31-geo-unbounded-timeline-and-daily-flight-cycle.md)
- [2026-08-31 Geo 时间轴响应性修复后的 Platform 文档归档审查](ai-logs/2026/08/2026-08-31-platform-documentation-archive-review-5.md)
- [2026-08-31 Geo 时间轴插件贡献响应性修复](ai-logs/2026/08/2026-08-31-geo-timeline-reactivity.md)
- [2026-08-31 Geo 2D 场景过渡相机状态修复](ai-logs/2026/08/2026-08-31-geo-2d-morph-camera-status.md)
- [2026-08-31 Geo Google 默认底图提交后的 Platform 文档归档审查](ai-logs/2026/08/2026-08-31-platform-documentation-archive-review-4.md)
- [2026-08-31 Geo 默认底图调整后的 Platform 文档归档审查](ai-logs/2026/08/2026-08-31-platform-documentation-archive-review-3.md)
- [2026-08-31 Geo Google 混合默认底图](ai-logs/2026/08/2026-08-31-geo-google-hybrid-default.md)
- [2026-08-31 Geo 人工验收修复后的 Platform 文档归档审查](ai-logs/2026/08/2026-08-31-platform-documentation-archive-review-2.md)
- [2026-08-31 Geo 工作台与地形人工验收问题修复](ai-logs/2026/08/2026-08-31-geo-workbench-terrain-acceptance-fixes.md)
- [2026-08-31 Geo OpenSky 实时航线展示](ai-logs/2026/08/2026-08-31-geo-opensky-live-flights.md)
- [2026-08-31 Geo 时间与状态栏交付后的 Platform 文档归档审查](ai-logs/2026/08/2026-08-31-platform-documentation-archive-review.md)
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
- [2026-08-20 Geo 数据面板与地图交互精简](ai-logs/2026/08/2026-08-20-geo-panel-interaction-refinement.md)
- [2026-08-20 Geo 前端交互完善](ai-logs/2026/08/2026-08-20-geo-frontend-interaction-completion.md)
- [2026-08-20 Geo 前端交互完善后的 Platform 文档归档复核](ai-logs/2026/08/2026-08-20-geo-frontend-interaction-archive-review.md)
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
