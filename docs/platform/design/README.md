# Platform 设计索引

- [master 分支集成](master-branch-integration.md)：保留本地桀士排版与远端 Geo 交付，合并 Platform 索引并复核共同合并树。

- [独立 AI 协作启动模板](ai-collaboration-starter.md)：已确认的无业务预设、三种启动工程、单项目文档与严格协作规则；P1 尚未实施。
- [独立启动模板提取清单](ai-collaboration-starter-extraction.md)：来源基线、保留/改写/排除项、隐式依赖与待验证证据。

- [桀士排版工作台 UI 与阅读交互](apps/jlab-wechat-editor-ui.md)：52px顶栏、悬停配色操作与弹窗改名、520px章节/历史抽屉、方括号内编号、公众号预览与阅读外壳。

- [桀士排版存储与文章版本](apps/jlab-wechat-editor-storage.md)：配置/固定结尾即时 localStorage、IndexedDB current 与主动时间戳版本、迁移和并发边界。

- [桀士排版独立应用](apps/jlab-wechat-editor.md)：JLab WeChat Editor 的产品范围、纯前端边界、单层工具栏、覆盖式左抽屉、章节列表、标题区操作、无占位拖拽双栏与实施状态。
- [桀士排版内部模块边界](modules/wechat-editor.md)：六个实际模块的公共入口、数据流、失败模式与静态检查覆盖。
- [公众号编辑器 HTML 与 CSS 兼容规则和实施准备](wechat-editor-wechat-compatibility.md)：官方规范、候选导出集合、素材和人工验收边界；研究草案，尚未实施或验收。
- [Punk 微排技术调研与复刻建议](wechat-editor-research.md)：原站架构、功能与复制证据；产品方案以桀士排版独立应用设计为准。
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
