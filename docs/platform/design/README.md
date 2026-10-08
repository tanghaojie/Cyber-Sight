# Platform 设计索引

- [master 分支集成](master-branch-integration.md)：保留双方仓库历史与 Geo 交付，合并 Platform 索引并复核共同合并树。

- [独立 AI 协作启动模板](ai-collaboration-starter.md)：CoAIForge P1 技术实现与 Windows/Linux CI 已通过，前端人工验收已由维护者确认通过；三种最小工程及单项目协作规范由目标仓库维护。
- [独立启动模板提取清单](ai-collaboration-starter-extraction.md)：来源基线、保留/改写/排除项、隐式依赖与待验证证据。

- [PRISM UI 接入](prism-ui-integration.md)：主题包、共享 UI、下游品牌与 Geo 兼容边界。

- [Geo 地标与自动周边街区](modules/geo-landmark-context.md)：外部 Overture/OSM 生成器、台北资产、场景索引与关联、瓦片昼夜及质量预算。

- [Geo 模型制作与地理参考标准](modules/geo-model-authoring.md)：模型/场景优化分类，PBR、UV、纹理与表面变化，统一 WGS84、锚点、高程、轴向及资产交付验收。

- [Geo 三档显示质量与模型坐标选择](modules/geo-render-quality-and-placement.md)：性能/平衡/兼容、近地光照、模型发光倍率与加载前坐标询问。

- [Geo 外部模型统一渲染标准](modules/geo-model-rendering.md)：只填外部 URL 和定位的自动昼夜、材质约定和资源生命周期。

- [Geo 前端空间可视化工作台](modules/geo.md)：定义 Forge 动态菜单、Viewer 生命周期、纯 Cesium 工具、插件适配、Vue UI 和旧功能迁移边界。
- [Geo 无界时间轴与每日循环航线方案](modules/geo-unbounded-timeline.md)：定义时间窗口、仿真 Clock、浏览器本地刻度与 UTC 每日循环模拟航班的实现语义。
- [Platform 运行时配置](runtime-configuration.md)：定义前端品牌、后端 API 元数据与 JWT identity 的环境变量边界和失败兜底。
- [Forge 集成与下游所有权](forge-integration.md)：记录 Foundation、Platform、Forge 的接入边界和本次同步策略。
- [上游同步](upstream-synchronization.md)：定义 Cyber-Sight 获取 Forge 更新、保留产品所有权和执行验证的流程。
- [品牌设计](branding.md)：定义 Cyber-Sight 产品品牌、创作者署名和视觉边界。
- [关于项目](about.md)：记录 Cyber-Sight 产品定位和平台入口。

- [独立产品拆分后的仓库边界](product-separation.md)：已迁出能力从应用、配置和专属文档移除，剩余业务分别维护。
