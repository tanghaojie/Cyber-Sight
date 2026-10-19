---
title: Geo 拍摄模块实施记录
scope: platform
repository: Cyber-Sight
status: completed
owner: project maintainers
date: 2026-10-19
---

# Geo 拍摄模块实施记录

## 用户目标与授权

为「AI建模世界」替代手动运镜录屏；用户确认网页逐帧方案并明确要求专门拍摄模块完成镜头工程、模板、机位、统一时间预览、净画面和逐帧输出。

## 初始事实与选择

- 工作区/暂存区为空；HEAD `ba0b3ca804b56b9d0a7c18d36a865b41ca0a449a`；Platform 归档 NOT_DUE。
- 保留 Geo 插件架构和唯一场景 Clock；模型现有 RAF 播放增加可恢复外部采样租约。
- 本机保存与 JSON 工程，Mediabunny MP4、fflate PNG ZIP，不增加后端。
- 环境未安装 RTK，使用原始命令；仓库明确禁止未经具体要求的前端自动化/浏览器测试，遵守静态检查与人工验收边界。

## 实施与验证

- 独立拍摄插件：高楼/宽体/建筑群/拼装模板、起止机位、镜头编辑排序复制、路径和画幅预览、统一时间、净画面、工程库与 JSON。
- Data 公开主体/加载状态与外部 TRS 采样租约；为内存 glTF 缺名/重名节点分配稳定唯一名称，通过公开节点 API 恢复。独立模型等待完整纹理，普通播放器在拍摄期间拒绝抢占，结束恢复。
- Scene 新增可恢复固定像素租约，暂停自适应降画质，不重置手工光照/阴影。切换面板、停止、后台、异常、取消和卸载都有释放路径。
- Mediabunny 1.61.6 按显式帧时间编码并封装 MP4；fflate 0.8.3 输出 PNG ZIP；支持单镜头、整片、目录批次及首尾静止余量。按帧等待加载与编码背压，固定输出尺寸、显式渲染、同步画布快照，取消通知编码器。
- `pnpm --filter @cyber-ai-forge/frontend build`：通过，最终 Vite 42.28 秒，两个 HTML 入口。
- `pnpm lint`、`pnpm format:check`、`pnpm architecture:check`、`pnpm docs:archive:check:ci`（NOT_DUE）、`git diff --check`：通过。
- 未创建或运行前端/浏览器自动化；保留实际 GPU/视频人工验收。当前场景渲染不承诺跨设备像素一致；形态权重、自动避障和音轨不在实现范围。内存下载上限 256 MB；可用时流式写盘，PNG ZIP 上限 3 GB。
- 现行设计、ADR、操作指南与关联设计已同步。构建保留既有 Sass/PURE/chunk 警告，不在本任务调整构建策略。

关联提交：本文件所属 `feat(geo): add capture studio and frame-by-frame export`；未推送、发布或修改远端应用。
