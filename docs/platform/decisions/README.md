# Platform 架构决策索引

当前 Platform 决策：

- [桀士排版独立仓库与工具链](ADR-20261008-jlab-independent-repository.md)：迁入 JLabWeChatEditor、采用 CoAIForge 0.2.0、完整保留功能/UI，不迁旧数据、首开空原稿，先交付可静态部署应用。

- [独立 AI 协作启动模板](ADR-20261007-independent-ai-collaboration-starter.md)：未来模板去除所有权 scope，保留严格协作协议，提供前端/后端空工程与全栈 health 示例；不改变本仓库现行身份。

- [桀士排版配置即时保存与主动文章版本](ADR-20261005-jlab-local-storage-history.md)：配置无历史，文章默认 current，主动时间戳版本。

- [桀士排版采用独立纯前端应用](ADR-20261004-jlab-wechat-editor-standalone-app.md)：独立 apps 应用、产品名称、技术栈、功能裁剪与工作台交互边界。

- [Geo 自动地标周边与显式场景索引](ADR-20261004-geo-generated-landmark-context.md)：素材侧生成共享 PBR/两级瓦片，Sight 显式关联模型与街区，保持真实地理布局和唯一时钟。

- [Geo 模型制作与地理参考契约](ADR-20261003-geo-model-authoring-and-georeference.md)：制作端与场景分工、统一局部米制/WGS84 字段，保留现有加载器及渲染边界。

- [Geo 三档质量与模型坐标选择](ADR-20261002-geo-render-modes-and-model-placement.md)：最高画质录屏、平衡默认、低配降级和模型定位来源确认，保留默认影像。

- [Geo 浏览器时区显示与太阳驱动环境光](ADR-20261002-geo-browser-time-and-solar-environment.md)：本地日历刻度、绝对时间求值、SUNLIGHT 与环境贴图更新精度。

- [Geo 外部模型统一渲染](ADR-20260911-geo-external-model-rendering.md)：Scene 统一标准、Data 自动接入、外部资产与渲染分离。

- [Geo 使用第二个 HTML 构建入口](ADR-20260901-geo-second-build-entry.md)：确定一次 Vite 多入口构建，同时输出 Sight 与 Standalone Geo，并共享唯一 Cesium 静态目录。
- [Geo 赛博城市 3D Tiles 启动预置](ADR-20260901-geo-cyber-city-tileset-preset.md)：确定启动成都建筑、CustomShader 程序化材质、单一 Clock 扫描、原始材质切换和 30 km 自动隐藏语义。
- [Geo 前端模拟航班数据](ADR-20260831-geo-simulated-flight-data.md)：确定离线每日循环航线、唯一 `viewer.clock`、Cesium 位置求值和无后端数据边界。
- [Geo 前端编译期插件架构](ADR-20260814-geo-frontend-plugin-architecture.md)：确定真实 Viewer 命名、纯工具与 Vue UI 分层、编译期插件、互斥交互和资源清理边界。
- [Geo 单一仿真时间与太阳光照](ADR-20260830-geo-simulation-time-and-solar-lighting.md)：确定唯一 `viewer.clock`、无界自定义底部时间轴、Scene 光照 capability 和太阳阴影边界。
- [Geo Google 混合默认底图](ADR-20260831-geo-google-hybrid-default.md)：确定启动时仅加载 Google · 混合底图，其他影像源由用户主动添加，并保留 GCJ-02 自动校正和可恢复的瓦片降级状态。
- [Cyber-Sight 下游身份](ADR-20260811-cyber-sight-downstream-identity.md)：确认产品品牌、技术兼容标识和下游仓库身份。
- [前端品牌文字配置收敛](ADR-20260811-frontend-brand-text-config.md)：统一前端品牌文字运行时配置。

历史品牌与项目级决策见[归档索引](../archive/README.md)。
