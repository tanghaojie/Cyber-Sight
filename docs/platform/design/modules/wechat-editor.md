---
title: 桀士排版内部模块边界
scope: platform
repository: Cyber-Sight
status: accepted
owner: project maintainers
updated: 2026-10-05
---

# 桀士排版内部模块边界

独立交付边界为 apps/wechat-editor。六个实际模块均在 src/platform/modules 内；无 Foundation、后台、契约、路由和空目录。

| 模块          | 职责与数据所有权                                            | 登记公共文件                                                                  | 依赖                                 | 失败模式与人工验证                                                              |
| ------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------- |
| article       | Markdown 语义、可序列化正文标注；不拥有完整草稿             | article.model.ts、article.service.ts、article-editor.vue、article-preview.vue | 无其他模块                           | 输入法、跨强调/链接/段落选区；拒绝代码/图片/结尾/装饰；改稿歧义标为失效         |
| typesetting   | 颜色角色、四类预设、九种章节、间距字体和对比度              | typesetting.model.ts、typesetting.service.ts、typesetting-panel.vue           | 无其他模块                           | 低对比度提示、设备字体差异；配置应用于预览和复制                                |
| ending        | 独立 Markdown 和启用模型；不写正文、不编号                  | ending.model.ts、ending.service.ts、ending-panel.vue                          | article                              | 启停、只追加一次、设置保存、刷新恢复                                            |
| assets        | 浏览器图片准备/尺寸、稳定 id/Blob、临时 URL 生命周期        | assets.model.ts、assets.service.ts                                            | 无其他模块                           | 缺图、CORS、解码、格式、大小、过期结果和 URL 释放                               |
| wechat-export | 显式只读快照、受控 DOM/内联、候选微信输出、剪贴板           | wechat-export.model.ts、wechat-export.service.ts                              | article、typesetting、ending、assets | 素材失败阻止复制；权限失败保留结果供重试；真实粘贴保存由人类验收                |
| workspace     | Pinia 命令编排、完整草稿与 IndexedDB 一致写入；抽屉/分栏 UI | workspace.store.ts、draft-storage.port.ts、workspace.page.vue                 | 上述五模块                           | 配额/恢复异常显示失败；未知版本不覆盖；多页面冲突提示暂停保存；关闭前未保存提示 |

Vue 公共文件是登记的呈现入口，使用 props/events 接受模型和命令，不读取其他模块的私有 store。App.vue 仅组装 workspace.page.vue，main.ts 注册 Vue/Pinia/Element Plus。workspace.service.ts、工作台子组件和 adapters/indexeddb-storage.ts 均为私有。

数据流：正文/设置事件 → workspace 命令 → 各模块公共领域服务 → 同一快照的预览/输出；完整草稿 → workspace 仓储端口 → IndexedDB 单记录事务（包含 Blob 和偏好）。保存操作排队，成功状态以事务完成为准。临时 DOM Range、抽屉、复制结果和 focus 不入库。预览渲染不持久化生成 HTML。

标注采用正文可着色文本的渲染偏移。每个 Markdown 文本 token 的 span 登记起止位置；选区转换为跨 token 的文本区间。纯样式修改不改变偏移；正文变更计算公共前后缀，仅迁移确定的区间，重复锚点或改动区间失效。源码不嵌入颜色标签，重叠后写优先、相邻同色合并。未采用模糊匹配或纯 DOM 包裹。

新增本地插图和 Markdown 下载命令已移除。旧草稿图片通过 asset:id 恢复；数据库保存 Blob，预览临时 object URL。HTTPS 图片可预览，导出 fetch/CORS 失败阻止复制。PNG/JPEG/WebP 大图等比缩到 1440×2400；WebP 转 PNG，保留透明；GIF 保持动画，大 GIF 超尺寸阻止导出。相对路径不扫描文件夹。原始 HTML 禁用，作为文本显示；所有预览/复制 HTML 来自受控解析和代码生成样式，经 DOMPurify 清洗。站外链接复制成可见网址。

应用内 scripts/check-boundaries.mjs 用 TypeScript AST 检查源文件依赖、公开文件、注册模块和依赖方向，覆盖 .ts/.vue 及字面量动态导入。仓库旧 architecture:check 不覆盖新应用；新应用 build 自动执行应用边界检查，因此根递归 build 也会覆盖它，或单独运行应用 architecture:check。共享检查器继续由 Forge 拥有。本轮不引入前端自动化测试。

手工验证清单见 [应用说明](../../../../apps/wechat-editor/README.md)。产品和范围见 [独立应用设计](../apps/jlab-wechat-editor.md)。

工作台使用四类 Element Plus 覆盖左抽屉（章节、文字、配色、结尾），不影响主栏宽度。章节列表点击即时更新排版配置；导入由 article-editor 事件交给 workspace 执行；article-preview 通过 mode/focus 事件通知 workspace 更新宽度与专注状态，不读取私有 store。分隔图标绝对定位在两栏边界，无占位列。失败备份提示统一指导手动复制原稿。技术验证见本次交互调整归档计划；功能仍由维护者人工验收。
