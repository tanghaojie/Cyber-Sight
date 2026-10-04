# 桀士排版 · Markdown 公众号排版助手

JLab WeChat Editor 是独立 Vue 3 / Pinia / Element Plus / Vite / TypeScript 纯前端单页，只面向横屏桌面（最小工作台宽度 1280px）。

```powershell
pnpm --filter @jlab/wechat-editor dev
pnpm --filter @jlab/wechat-editor typecheck
pnpm --filter @jlab/wechat-editor architecture:check
pnpm --filter @jlab/wechat-editor build
pnpm --filter @jlab/wechat-editor preview
```

开发地址 http://127.0.0.1:5174，构建预览 http://127.0.0.1:4174。静态部署 apps/wechat-editor/dist；相对 base 支持子路径。请使用独立 HTTPS origin，与管理系统隔离。支持具备 IndexedDB、ResizeObserver、PointerEvent、ClipboardItem 的现代桌面 Chrome/Edge；复制需安全上下文。生产域名本轮未指定。

## 使用

- 单层顶栏直接调整正文色、局部字色与章节样式；选中右侧普通正文后再改局部颜色。
- 文字设置、配色实验室、固定结尾从左侧打开非模态占位抽屉，修改实时生效。
- 拖拽分隔线调整两栏，聚焦手柄可用左右键/Home/End；专注预览保留原比例。
- 单文件导入限 UTF-8 `.md`/`.txt`，2 MB / 50 万字符。原始 HTML 按文本显示，基础 Markdown 支持标题、强调、引用、列表、代码、表格、图片与链接。
- 图片按钮在原稿光标处插入单张 PNG/JPEG/GIF/WebP，10 MB / 4000 万像素限制。相对图片路径不会自动访问目录，请重新插图。
- 草稿、设置、局部标注、结尾、Blob 与比例保存在当前浏览器 IndexedDB；只在写入完成后显示已保存。存储失败或异常草稿不显示成功、不静默覆盖。
- 改稿后无法确定的局部标注会失效；再次选择文字即可重设。下载 Markdown 只备份原稿，**不包含附加设置、结尾或本地图片文件**。
- 复制包含 HTML 和纯文字；图片失败会阻止复制。权限拒绝后可点击「复制已准备内容」重试。站外链接转换为可见网址。

四类配色、九种章节为独立实现，视觉取原研究方向，未声明与原站逐像素一致。明确 Markdown 标题参与章节样式，TXT 不自动猜章节。微信输出为 `wechat-clipboard@0.1-candidate`，未经真实公众号验收。

## 人工验收

此清单等待维护者执行，静态检查与构建不代替功能验收。

1. 1280×720、1440×900：工具栏单层，三个抽屉互斥且不覆盖预览，设置实时生效。
2. 拖拽、释放、取消、失焦、键盘调比例；抽屉/专注开关后比例恢复。
3. 中文输入法、单文件导入/UTF-8 失败与长度限制、代码 Tab 缩进。
4. 跨加粗/链接/段落选区改色；混选代码、图片、装饰或结尾整次拒绝；换主题不丢标注；改稿歧义提示。
5. 改稿、结尾启停、字体与间距、插图后刷新恢复；存储禁用/配额失败及未知版本不覆盖；另一页面保存冲突暂停。
6. 插图真实显示/尺寸、缺图、远程 CORS、GIF 动画/WebP/透明图及超尺寸提示。
7. 长代码不截断、表格换行、列表/嵌套/起始序号、站外 URL；手机/电脑按钮只模拟文章宽度。
8. 剪贴板权限拒绝重试、准备中改稿不复制旧快照；TXT 接收纯文字，公众号接收富文本。
9. 公众号粘贴 → 保存再打开 → 微信明暗阅读，核对颜色、表格、代码、图片托管和文章完整性。记录账号、浏览器/微信版本、输出 profile 和缺失项。

## 依赖与边界

markdown-it 15.0.2（MIT），DOMPurify 3.4.16（Apache-2.0 或 MPL-2.0）；其余沿用仓库技术栈并锁定在 pnpm-lock.yaml。新应用归 Platform，不依赖 apps/frontend/backend 或私有代码；无路由、后端、登录、云备份、IP、教程、文章包和自动发布。

设计见 [独立应用](../../docs/platform/design/apps/jlab-wechat-editor.md) 与 [模块边界](../../docs/platform/design/modules/wechat-editor.md)。
