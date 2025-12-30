# Valdi Docs 产品设计与交互考量

## 一、产品定位

Valdi Docs 是针对 Valdi 跨平台开发框架的官方文档与学习站点，核心目标：

- **降低学习成本**：以入门指南 + 进阶文档 + Codelabs 的结构，帮助开发者从 0 到 1 上手 Valdi。
- **支持日常查阅**：提供清晰可查的 API Reference，方便在日常编码过程中快速检索。
- **适配多种工作流**：通过导航分区（Core、Native、Workflow、Performance 等）映射开发者真实工作场景。

## 二、信息架构设计

### 2.1 内容组织

项目将所有内容统一存放在 `src/content` 下，并通过路径和文件名前缀来划分信息层级：

- **`docs/`**：核心文档与概念说明（Getting Started、Core Concepts、Native Integration 等）。
- **`api/`**：API 速查与详细元素/属性说明。
- **`codelabs/`**：分步骤的动手实验教程，按专题分子目录（Getting Started、Advanced UI、Integration with Native 等）。

这种结构的设计考虑：

- **物理结构即信息架构**：目录与前缀统一表达内容类型，减少重复配置。
- **支持自动导航生成**：通过文件名前缀与 slug 规则，可以在构建阶段自动生成导航树。

### 2.2 导航分组与排序

在逻辑层中通过 `DOCS_CATEGORIES`、`API_SECTIONS`、`CODELABS_SECTIONS` 等配置，明确了导航分组与顺序：

- **按使用阶段分组**：Getting Started → Core Concepts → Native Integration → Advanced → Performance → Workflow。
- **按任务场景分组**：API Reference 独立为一个入口；Codelabs 单独构建分区，适合“边做边学”。
- **排序可配置**：每个 Section 与 Item 均有 `order` 字段，用于控制展示顺序，便于文档扩展时保持导航的整体性。

这种设计的好处是：

- **导航是计算出来的，而不是手写维护**，减少文档变更时的同步成本。
- **导航配置集中管理**，可以在一个地方调整整体 IA，而无需改动各个 UI 组件。

## 三、内容加载与路由解析

### 3.1 内容加载策略

文档内容采用 `import.meta.glob` 在构建期一次性索引所有 `.md` 文件：

- **优点**：
  - 编译期可知所有内容，便于生成静态导航、预渲染页面。
  - 避免在 UI 层散落多个加载逻辑，形成单一内容源。
- **考虑**：
  - 当前实现依赖 Vite/SvelteKit 的打包能力，未来迁移框架时，只需在 utils 中替换具体实现。

`getAllDocs` / `getDocBySlug` / `getDocsByCategory` 等函数将加载逻辑封装为纯函数，外部只需关心：

- 通过 `slug` 获取文档。
- 通过 `category` 获取某一分区的文档列表。

### 3.2 标题与元数据

为了减少对 frontmatter 的硬依赖，系统提供了**两级标题回退机制**：

1. 优先读取 `metadata.title` 作为文档标题。
2. 若不存在，则从文件名中根据约定前缀与分隔符自动推导标题。

这保证了：

- 早期迁移/导入的文档不必全部补齐 frontmatter，也能正常出现在导航中。
- 标题规则显式、稳定，文件重命名即可更新导航展示文本。

### 3.3 路由解析

路由解析从 UI 框架中剥离为 `resolveDocRoute(slug)` 的纯逻辑：

- **输入**：`slug`（例如 `docs/start-introduction`、`api/api-quick-reference`）。
- **输出**：`{ status, data?, error? }` 结构，约定：
  - `status = 200`：返回 `{ content, metadata }`。
  - `status = 404`：文档不存在。
  - `status = 500`：加载过程中发生异常。

这样设计的原因：

- **UI 不关心内容来源**，只根据状态与数据渲染对应页面/错误态。
- 未来更换路由系统或运行环境（SPA、MPA、Serverless）时，只需保留相同的路由解析接口即可。

## 四、首页文案与可配置性

首页内容（标题、副标题、按钮文案、跳转链接、主功能卡片）被统一抽象为 `HOME_CONTENT` 配置：

- **文案统一出口**：所有首页展示文字集中配置，便于统一校对与多语言扩展。
- **跳转链接显式化**：`href` 全部集中管理，避免 UI 内部硬编码路径，降低链接变更成本。
- **可扩展性**：通过 `features` 数组可以添加/删除功能卡片，而无需调整 UI 组件结构。

交互上考虑：

- 首页主要承担“入口聚合”角色，提供快速通往：
  - 新手入门文档。
  - API 参考文档。
  - Codelabs 实战教程。
- 按钮区采用主次按钮样式区分“首推路径”（Get Started）与“工具型路径”（API Reference）。

## 五、导航与布局交互设计

### 5.1 顶部导航

顶部导航对三类核心资源提供一跳入口：

- **Docs**：面向概念与工作流的阅读。
- **API**：面向编码时的查阅。
- **Tutorials**：面向学习路径与实践的动手教程。

设计考量：

- **保持主导航稳定**：减少顶部入口变动，让用户形成肌肉记忆。
- **路径前缀即语义**：`/docs`、`/api`、`/docs/codelabs` 与顶栏入口一一对应，降低 URL 认知成本。

### 5.2 左侧侧栏导航

在文档阅读场景下，左侧 `Sidebar` 负责：

- 按 Section 分组展示导航树（基于 `NavSection` 定义）。
- 使用手风琴模式展开/折叠，保证：
  - 当前文档所在 Section 默认展开。
  - 同一时间只展开一个 Section，避免过长的导航列表。

交互考量：

- **可预判、可回溯**：
  - 用户可以清晰看到当前文档在整个知识体系中的位置（属于哪个 Section）。
  - 切换 Section 时，导航高度保持可控，减少滚动负担。
- **路径对齐**：导航项 `href` 与路由 `slug` 一一对应，便于复制 URL 与分享。

### 5.3 内容区域

内容区域的设计偏向阅读体验：

- 适中宽度（避免过长行宽影响阅读）。
- 为文档内容包裹独立区域（背景、圆角、阴影），增强可读性与视觉分组感。

## 六、可维护性与可迁移性

为支持未来迁移到其他框架（如 React、Vue、自研 Runtime 等），整体设计遵循：

- **逻辑与 UI 分离**：
  - 内容加载、导航生成、路由解析、首页文案均通过纯 TS 模块暴露接口。
  - UI 组件只消费 `{ navigation, content, metadata, HOME_CONTENT }` 等数据结构。
- **数据结构稳定**：
  - `Doc`、`NavItem`、`NavSection`、`HomeContentConfig` 等类型作为契约存在。
  - 不同 UI 层只要遵守这些契约即可互换实现。
- **最小依赖原则**：
  - 逻辑层只依赖打包器提供的内容加载能力（当前是 `import.meta.glob`）。
  - 其余部分均为纯 TypeScript 函数，方便在 Node、浏览器或 Serverless 环境中重用。