---
scope: platform
status: completed
---

# 建筑拼装材质与光照对照修正

目标：修正用户截图中全灰材质及低清显示，并让 Blender 实体工作室外观与场景日光可对比。

证据：当前 Blender 的材质视口颜色不同，但四个 Principled Base Color 均为灰色；发布 GLB 与之一致。仅在临时预览内存副本恢复配色，不更改用户模型源文件。增加柔光/日光对照，复用 Scene 画质所有权。

退出：类型、lint、格式、DEV 模块编译、生产构建排除预览及归档检查通过；视觉由维护者人工确认。同步设计和协作记录后本地提交，不推送。

实际交付：新增下载后 GLB JSON 配色恢复工具，保留其他数据段；柔光 Shader 与场景日光切换、销毁及注销；Scene 画质 capability 复用现有分辨率所有者，临时面板请求原生像素高清档，移除/退出恢复旧档。

验证：前端类型与生产构建通过，变更文件 lint、架构检查通过；DEV 面板及动画工具模块响应 HTTP 200。格式及归档 CI 在收尾执行。不运行浏览器自动化，GPU Shader 与肉眼效果由维护者刷新后查看，不声称已与 Blender 像素一致。Sass、PURE 注释和大包提示为现有构建提示。关联提交为包含本记录的 `fix(geo): restore assembly preview colors and lighting`。
