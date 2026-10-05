# Platform 设计索引

- [桀士排版独立应用](apps/jlab-wechat-editor.md)：JLab WeChat Editor 的产品范围、纯前端边界、单层工具栏、覆盖式左抽屉、章节列表、标题区操作、无占位拖拽双栏与实施状态。
- [桀士排版内部模块边界](modules/wechat-editor.md)：六个实际模块的公共入口、数据流、失败模式与静态检查覆盖。
- [公众号编辑器 HTML 与 CSS 兼容规则和实施准备](wechat-editor-wechat-compatibility.md)：官方规范、候选导出集合、素材和人工验收边界；研究草案，尚未实施或验收。
- [Punk 微排技术调研与复刻建议](wechat-editor-research.md)：原站架构、功能与复制证据；产品方案以桀士排版独立应用设计为准。
- [PRISM UI 接入](prism-ui-integration.md)：主题包、共享 UI、下游品牌与 Geo 兼容边界。

- [Geo 外部模型统一渲染标准](modules/geo-model-rendering.md)：只填外部 URL 和定位的自动昼夜、材质约定和资源生命周期。

- [Geo 前端空间可视化工作台](modules/geo.md)：定义 Forge 动态菜单、Viewer 生命周期、纯 Cesium 工具、插件适配、Vue UI 和旧功能迁移边界。
- [Geo 无界时间轴与每日循环航线方案](modules/geo-unbounded-timeline.md)：定义时间窗口、仿真 Clock、UTC 刻度与每日循环模拟航班的实现语义。
- [Platform 运行时配置](runtime-configuration.md)：定义前端品牌、后端 API 元数据与 JWT identity 的环境变量边界和失败兜底。
- [Forge 集成与下游所有权](forge-integration.md)：记录 Foundation、Platform、Forge 的接入边界和本次同步策略。
- [上游同步](upstream-synchronization.md)：定义 Cyber-Sight 获取 Forge 更新、保留产品所有权和执行验证的流程。
- [品牌设计](branding.md)：定义 Cyber-Sight 产品品牌、创作者署名和视觉边界。
- [关于项目](about.md)：记录 Cyber-Sight 产品定位和平台入口。
