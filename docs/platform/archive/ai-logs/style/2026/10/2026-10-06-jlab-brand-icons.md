---
title: 桀士排版品牌与按钮视觉调整
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-10-06
updated: 2026-10-06
---

# 桀士排版品牌与按钮视觉调整

用户要求移除英文应用名，只保留中文标题、副标题，按钮增加容易理解的图标，弱化手机外壳黑色边框。采用标题“桀士排版”、副标题“公众号助手”、浏览器标题“桀士排版·公众号助手”；保留内部包名与存储键以维持兼容。图标采用内联 SVG，不引入依赖或新模块。技术检查和人工验收边界见对应计划。

实际调整覆盖设置、复制、导入、预览模式、历史版本、配色保存/重置、结尾追加/清空及诊断清除操作；手机框由8px深色改为3px浅灰。ESLint、类型、构建、模块和所有权检查通过；格式、diff及归档CI完成后提交。保留第三方PURE注释和主包大小提示。没有运行前端自动化或浏览器测试，图标观感与手机轮廓待人工验收。关联提交为包含本记录的 `style(wechat-editor): simplify branding and add action icons`。
