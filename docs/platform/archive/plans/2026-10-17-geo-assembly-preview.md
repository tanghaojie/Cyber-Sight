---
scope: platform
status: completed
---

# 本地建筑拼装预览

目标：通过已发布 GLB 在本地 Geo 展示构件拼装，供维护者人工查看。

1. 确认暂存区为空、工作区无已有改动、归档审计 NOT_DUE；下载已发布模型。
2. 编写 DEV 显式启用的面板与独立动画工具，复用资源准备及渲染能力。
3. 执行格式、类型、lint、构建和归档 CI 检查，启动本地入口。
4. 记录实际验证及人工验收边界，归档并创建本地提交，不推送远端。

设计：[Geo 本地建筑拼装预览](../../design/modules/geo-assembly-preview.md)。

结果：DEV + `assemblyPreview=1` 的组件和动画工具已实现，本地服务 `http://localhost:5173/geo.html?assemblyPreview=1` 返回 HTTP 200。线上资源 HTTP 200、正确 GLB MIME、CORS `*`，与本地源逐字节一致，SHA-256 为 `fb3393f7acd0d15521f1521f697da34b12c9f2514ff639ef44cbca6e54baeded`。

验证：前端类型检查、生产构建、变更文件 lint、架构检查通过。生产产物未发现预览参数、模型 URL 或组件文案。最终格式及归档 CI 作为同一提交前门禁执行。既有 Sass 弃用、第三方 PURE 注释及大包提示不阻断构建。

交付边界：浏览器视觉与交互由维护者人工验收，未运行前端自动化。入口已请求在 Codex 打开；服务保持运行。关联提交为包含本记录的本地 `feat(geo): add local building assembly preview`，不推送远端。
