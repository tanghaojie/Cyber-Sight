---
title: Geo 第一轮显示优化协作记录
scope: platform
repository: Cyber-Sight
owner: project maintainers
change_type: feat
status: completed
date: 2026-10-02
---

# 协作摘要

- 用户目标：三档显示模式、GLB坐标来源询问；保留默认影像，完成先前现实感方案第一轮。
- 命名：性能为最高画质/录屏，平衡默认，兼容低配。
- 现状：工作区和暂存区均为空；归档审计NOT_DUE；当前分支包含先前浏览器时区/SUNLIGHT修正。
- 关键取舍：场景级模式，不逐模型调参；独立模型副本做发光倍率适配；height_m不作为椭球高；坐标选择先于Primitive加入；保持唯一Clock。
- 当前边界：不制作资产/街区，不改影像，不实现后续自动环绕与双环境图缓存。前端GPU、3600倍速效果与对话框由维护者人工验收。
- 实施：Scene质量工具拥有唯一分辨率控制器；性能原生DPR、4096软阴影、支持时HDR/AO与夜间柔光，平衡默认自适应、2048软阴影，兼容30 FPS低像素与主要特效关闭。模型保留独立太阳求值、夜间漫反射/镜面分开校准、低太阳暖色与极低蓝灰环境补光近似。
- 加载：解析独立GLB/glTF2.0副本，适配当前Cesium未支持的发光倍率，不改源文件；只读取明确WGS84字段，height_m继续是尺寸。活动scene/root坐标先经原生dialog确认；overlay避免面板关闭导致请求挂起；取消、失败及卸载释放Promise/Blob/Shader/监听器。
- 定位与镜头：缺少定位椭球高时采样当前地形，地形变更/失败不静默置零；输入姿态与缩放保留。按画幅/视场/包围球取景；默认成都预置不在异步完成后覆盖当前相机。
- 验证：pnpm format、format:check、Geo ESLint、architecture:check、frontend生产构建（含Vue/TS与双入口）、docs:archive:check:ci（NOT_DUE）、diff检查通过。初次Vue类型检查的问题已修正：Blob的ArrayBuffer类型、公开SH setter的undefined声明缺失、可选frustum类型。未创建或运行前端/浏览器自动化测试。
- 偏差与限制：柔光在色调映射之后，蓝灰补光是视觉近似，不称物理灯光或HDR Bloom；高速环境更新只限制时间差，不实现双图插值或保证无闪烁。原模型无UV/贴图，二维卫星影像固定照片阴影仍需资产与背景层面解决。默认Google图层未改变，glTF明确支持2.0。
- 关联提交：本记录与代码同提交，消息 `feat(geo): add rendering modes and model coordinate selection`，AI trailer为GPT-6。人工验收与后续阶段见现行设计和同轮归档计划。
