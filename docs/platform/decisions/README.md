# Platform 架构决策索引

当前 Platform 决策：

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
