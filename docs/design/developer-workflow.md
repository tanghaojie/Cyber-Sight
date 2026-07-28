---
title: 开发工作流
status: accepted
owner: project maintainers
updated: 2026-07-28
---

# 开发工作流

## 源码导入

`apps/frontend`、`apps/backend` 和 `packages/api-contract` 分别把 `@` 映射到本
workspace 的 `src` 目录。导入当前目录或子目录文件时保留 `./` 相对路径；只要导入路径
需要先返回上级目录，就从 `@/` 开始写完整的源码路径。

别名同时登记在 TypeScript 和实际执行工具中：前端由 Vite/Vitest 解析，后端与契约包在
TypeScript 编译后由 `tsc-alias` 把别名改写成可被 Node.js 执行的相对路径，后端 Vitest
另登记同一别名。`import.meta.glob` 使用 Vite 支持的 `@/` 别名。文件系统 URL 等不是模块
导入的运行时相对路径不参与迁移。

契约包的 `build` 与 `test` 都必须在 `tsc` 后执行 `tsc-alias`。根目录测试会先运行契约包，
再并行运行前后端测试；若契约测试只执行 `tsc`，就会用未改写的产物覆盖可运行的 `dist`。

## 代码格式

根目录 `.prettierrc.json` 是仓库唯一格式配置，固定为无分号、单引号、每行最多 100 字符，
与维护者当前 VS Code 习惯一致。`.gitattributes` 把文本文件统一为 LF，避免 Windows Git 的
自动换行转换与 Prettier 反复改写同一批文件。根目录命令如下：

- `pnpm format`：格式化仓库内受支持的源码和文档。
- `pnpm format:check`：只检查格式，不修改文件，供 AI 和自动化验证使用。

`.vscode/settings.json` 让 Prettier 扩展在保存支持的文件时读取仓库配置并自动格式化；
`.vscode/extensions.json` 推荐安装对应扩展。个人编辑器设置不是团队规范来源，后续格式变化
应先修改仓库配置。

## Git 与 AI 门禁

`simple-git-hooks` 安装执行 `pnpm lint-staged` 的 pre-commit hook，`lint-staged` 仅对本次已暂存、且属于支持类型的文件
执行 Prettier，然后把格式化结果保留在本次提交中。这样不会顺带改写未暂存的历史文件，
也不能替代构建和测试。

AI 修改代码时必须遵循根目录 `AGENTS.md`：生成内容直接服从仓库 Prettier 配置，验证阶段
执行 `pnpm format` 和 `pnpm format:check`，再运行与改动相称的测试和构建。

## 失败模式与验证

- hook 未安装：重新执行 `pnpm install` 或 `pnpm prepare`，并确认 `.git/hooks/pre-commit`
  调用 `pnpm lint-staged`。
- 编辑器格式与提交结果不同：检查是否安装推荐的 Prettier 扩展，以及是否启用
  `prettier.requireConfig`。
- Node.js 产物仍包含 `@/`：构建脚本必须在 `tsc` 后执行 `tsc-alias`，并在生产构建后搜索
  `dist` 验证没有残留源码别名。
- 交付验证至少执行 `pnpm format:check`、`pnpm test` 和 `pnpm build`。

长期取舍见 [ADR-0021](../decisions/ADR-0021-source-alias-and-automated-formatting.md)。
