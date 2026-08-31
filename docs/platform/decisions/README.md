# Platform 架构决策索引

当前 Platform 决策：

- [Geo OpenSky 实时航班数据边界](ADR-20260831-geo-opensky-live-flight-tracking.md)：确定后端匿名代理、当前视域轮询、会话短轨迹和墙钟/仿真时间边界。
- [Geo 前端编译期插件架构](ADR-20260814-geo-frontend-plugin-architecture.md)：确定真实 Viewer 命名、纯工具与 Vue UI 分层、编译期插件、互斥交互和资源清理边界。
- [Geo 单一仿真时间与太阳光照](ADR-20260830-geo-simulation-time-and-solar-lighting.md)：确定唯一 `viewer.clock`、自定义底部时间轴、Scene 光照 capability 和太阳阴影边界。
- [Geo 影像默认源、失败隔离与坐标校正](ADR-20260820-geo-imagery-defaults-and-coordinate-correction.md)：确定 Natural Earth 本地兜底、远程候选源主动加载、GCJ-02 自动校正和可恢复的瓦片降级状态。
- [Cyber-Sight 下游身份](ADR-20260811-cyber-sight-downstream-identity.md)：确认产品品牌、技术兼容标识和下游仓库身份。
- [前端品牌文字配置收敛](ADR-20260811-frontend-brand-text-config.md)：统一前端品牌文字运行时配置。

历史品牌与项目级决策见[归档索引](../archive/README.md)。
