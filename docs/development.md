# 开发规则

本文档根据本仓库当前约定整理，与 [README](../README.md) 互补：README 侧重上手与模块说明，本文侧重协作与编码规则。

## 1. 项目定位

- **技术栈**：uni-app（Vue 2）、`@dcloudio/*` 2.x、Sass。
- **用途**：会员等业务使用的营销模板与组件库；可独立跑 H5，也可作为插件包嵌入宿主小程序 / H5。
- **浏览器范围**（`package.json` 的 `browserslist`）：Android ≥ 4.4、iOS ≥ 9。

## 2. 仓库与分支

- `packages` 类仓库以**独立仓库**管理不同营销模板；**`master` 为最终发布代码分支**（详见 README）。
- 功能开发在约定功能分支上进行，合并前保持与 `master` 的评审与集成流程一致（以团队实际流程为准）。

## 3. 页面与分包

- **`src/pages.json` 中声明的页面才会进入打包结果**；新增页面必须配置 `path` 与 `style`。
- 页面路径与文件名使用 **kebab-case**，且与 `pages.json` 中的 `path` 一致（见下文命名规范）。
- 不同业务线通过条件编译（如 `#ifdef H5-ACT` / `#ifdef H5-SCAN`）区分入口与页面集合，修改时注意不要破坏另一端构建。

## 4. 路径别名与 `import` 约定

`vue.config.js` 将 `@` 与 `packages` 均指向 `src`：

| 写法 | 含义 |
|------|------|
| `import x from 'packages/...'` | **始终**解析为本仓库 `src` 下的文件，独立运行与作为插件包时行为一致。 |
| `import x from '@/...'` | 解析为**当前运行上下文**的 `src`：独立运行时为本仓库；作为插件包嵌入时为**宿主项目**的 `src`。 |

**多端（小程序 + H5）共用逻辑时**：若希望宿主替换实现，用 `@/` 且保证宿主侧存在对应文件；若希望固定使用本仓库实现，用 `packages/`。

## 5. 自定义平台与本地命令

`package.json` → `uni-app.scripts` 定义两套 H5 场景：

| 脚本 | 说明 |
|------|------|
| `yarn serve` / `yarn build` | 互动营销 H5（`h5-act`，编译宏 `H5-ACT`） |
| `yarn serve:scan` / `yarn build:scan` | 扫码模板 H5（`h5-scan`，编译宏 `H5-SCAN`） |

开发前确认当前需求对应哪条脚本，避免在错误产物上调试。

## 6. 命名规范（摘要）

与 README 一致，开发时遵守：

1. 目录、文件名：**kebab-case**。
2. 类、构造函数、装饰器：**PascalCase**。
3. 函数、变量、参数：**camelCase**。
4. 常量：推荐 **CONSTANT_CASE**。
5. `pages.json` 的 `path`：与页面文件名一致（kebab-case）。
6. 单文件组件 `name`：**PascalCase**。
7. 对外导出的接口方法：`camelCase`，且以 `api` 为前缀，如 `apiGetFooBar`。

## 7. 代码风格与 Lint

- 格式化：**Prettier**（注意与换行符约定配合，见下节）。
- 静态检查：`yarn lint` → `eslint --fix --ext .vue,.js src`。
- 若无单独提交的 ESLint 配置文件，以仓库内既有代码风格为准；**避免大范围无功能性格式化**，减少无关 diff。
- 仅在必要时使用 `eslint-disable`（如第三方拷贝文件、明确例外），并尽量缩小作用范围。

## 8. 换行符与 Git

- 仓库统一使用 **LF**；VS Code 可将「End of Line」设为 `lf`。
- 推荐 Git 配置：`git config --global core.autocrlf input`（提交转 LF，检出不强制 CRLF），避免 Prettier 对 CRLF 告警。

## 9. 提交信息

- 项目配置了 **Commitizen**（`package.json` → `config.commitizen`）。
- 推荐流程：`git add` 后执行 `git cz`，按提示生成符合约定的 message，再推送至远程分支。

## 10. 代理与接口调试

`vue.config.js` 中 `devServer.proxy` 配置了 `/mock`、`/mkt` 等代理；本地联调时按需使用，**勿将内网地址作为默认提交内容**（若需改 target，优先本地覆盖或环境变量方案，按团队规范执行）。

## 11. 扩展阅读

- [Vue CLI 配置说明](https://cli.vuejs.org/config/)
- README 中的「装修组件」[业务端小程序接入说明](https://miduo1031.yuque.com/xbe40z/manual/nmek4g)
- README 中的 **mixins**（`loadMoreMixin`、`subscribeMsgMixin`）用法与示例
