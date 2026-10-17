---
scope: platform
status: completed
---

# 建筑拼装外观修正

用户提供网页与 Blender 截图，指出材质和光照差距。暂存区和工作区为空，归档检查 NOT_DUE。Blender MCP 只读核实四种 `diffuse_color` 与实际 Principled 节点不一致，节点与 GLB 均全灰。不能将此误报为 Cesium 材质丢失。

实际改动：预览内存副本按明确材质名恢复四种视口颜色，二进制段保持；柔光对照/场景日光切换，释放自有 Shader 或统一渲染句柄；Scene 发布画质 capability，临时预览请求高清并按条件恢复。原 Blender 和已发布 GLB 保留，不把灰色导出误判为前端材质加载故障。

验证：类型与生产构建通过，变更文件 lint、架构检查通过，DEV 面板及工具模块响应 HTTP 200。最终格式及归档 CI 为收尾门禁。不运行前端/浏览器自动化，尚未进行 GPU 和肉眼一致性验收；柔光为便于配色对照的近似照明，不是 Blender 渲染复刻。关联提交为包含本记录的本地 `fix(geo): restore assembly preview colors and lighting`，不推送。
