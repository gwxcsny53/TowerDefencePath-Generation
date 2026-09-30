# TDPE UI Migration Plan v1

> 项目：Tower Defense Path Editor  
> 文档类型：UI Presentation Migration 执行计划  
> 基线分支：`main`  
> 基线提交：`bf6ddbee40b30a84ebb514c14f2b51deaf871ac9`  
> 主要验收尺寸：`1440 × 900`  
> 状态：Planning Baseline / M1 尚未开始

---

## 1. 文档目的

本计划把 TDPE 当前 UI 审计结果与 `TDPE UI Design System v1` 转换为一条可分阶段实施、逐阶段运行、逐阶段浏览器验收、可单独回滚的迁移路径。

本次工作定义为：

> **Presentation Migration，不是应用架构重写。**

迁移只改变视觉层、布局层、展示组件和表现动画，不借 UI 重构之机改造 Store、Domain、Editor Runtime、Persistence、Import/Export 数据契约或 Canvas 渲染语义。

计划采用八个严格有序的 Milestone：

```text
M1 Foundation
  ↓
M2 Editor Shell
  ↓
M3 Base Controls
  ↓
M4 LevelPanel / Inspector / Junction
  ↓
M5 ToolDock / Validation / Route Preview
  ↓
M6 Liquid Motion
  ↓
M6.5 Canvas Dark Theme
  ↓
M7 Optical Refraction / Performance
```

每个 Milestone 必须能够：

1. 独立提交；
2. 独立启动；
3. 独立通过现有静态检查和测试；
4. 独立在浏览器完成状态验收；
5. 不依赖尚未合并的下一 Milestone 才能正常使用；
6. 出现回归时可以整体回滚，不污染 Store / Domain 历史。

---

## 2. 输入基线

逻辑输入文档：

- `docs/TDPE_UI_Design_System_v1.md`
- `docs/TDPE_Current_UI_Audit.md`

编写本计划时，仓库内实际存在的设计系统文件位于根目录 `TDPE_UI_Design_System_v1.md`；Current UI Audit 来自已完成的 1440×900 浏览器审计产物。本文不负责移动、复制或重写这两份源文档。

当前实测关键事实：

- 当前页面是浅色、边框分隔、全宽工具栏式编辑器，不是 Dark Liquid Glass。
- 1440×900 下实际结构为 52px TopBar、240px LevelPanel、380px Inspector、48px 全宽 ToolPalette、160px 固定 Validation。
- Canvas 语义色、选择反馈、Validation 定位、Route Preview 状态流是现有体验中最应保留的部分。
- Junction Inspector 是当前最复杂、最容易产生视觉和功能回归的 UI。
- 普通按钮 Hover / Press 反馈不足；部分 Enabled 与 Disabled 状态视觉相同。
- Validation 永久占据底部空间；ToolPalette 不是 Canvas 内浮动 ToolDock。
- Route Preview 已具备 playing / completed / stopped / replay / close 状态，但视觉仍是白色卡片。

---

## 3. 全局迁移原则

### 3.1 不可破坏的行为契约

以下行为在 M1–M7 全程必须保持：

- 组件现有 emits 名称、参数和触发时机；
- `editorStore` 现有 actions、computed 状态和调用方向；
- 工具快捷键 1–6；
- Undo / Redo 的可用状态、命令边界和行为；
- autosave 与 `loading / saving / saved / error` 状态；
- Validation 的 `not-run / stale / passed / failed` 状态行为；
- 编辑后 Validation 变 stale 的规则；
- Route Preview 在新鲜校验通过后才可用的门禁；
- Route Preview 的 `playing / completed / stopped / replay / close` 行为；
- Validation Issue 点击后聚焦 Canvas 对应位置；
- New Level 默认值、Resize no-op 禁用、Resize impact summary；
- Import 的无冲突导入、冲突覆盖/副本、项目备份替换分支；
- Export 的游戏运行时配置与项目备份两个独立出口；
- Junction 的候选识别、创建、删除、方向角色互斥、disabled reason、权重和与权重提交；
- Spawn 每格耗时只在合法 `change` 提交后进入历史，不改为每次输入都写 Store；
- Tower 初始锁定、对象选择、Canvas 坐标解析与现有语义渲染。

### 3.2 全局禁止范围

除非后续另立专项并取得明确授权，M1–M7 均不得修改：

- `src/ui/stores/editorStore.ts` 的业务语义、action 签名或状态机；
- `src/core/**`；
- `src/editor/**`；
- `src/io/**` 的序列化、反序列化与文件格式；
- `src/persistence/**`、IndexedDB schema 或迁移版本；
- `src/renderer/**` 的地图语义与坐标系统；
- `src/renderer/RenderTheme.ts` 的整体深色化；
- `MapValidator`、`RouteSimulator`、Junction Editor 规则；
- 新增业务默认值、业务 fallback 或数据兼容分支；
- 为方便 UI 而重命名或合并现有 Store actions；
- 为方便布局而改变 Canvas 网格尺寸、命中范围或渲染比例；
- 一次性替换全部 UI 的大型 Rewrite。

如 UI 组件无法在不改变上述范围的前提下完成，应停止该 Milestone，记录阻塞点，而不是扩大修改范围。

M1–M6 不得修改 Renderer semantic theme。M6.5 是专项授权例外，允许调整视觉 palette、把 Selection 颜色接入 `RenderTheme`，以及校准 Spawn、End、Tower、Locked Tower 的纯视觉 Marker 底形和图标；Renderer 的网格几何、绘制顺序、坐标、命中和业务语义仍不得改变。M7 不再重设计 Canvas palette 或 Marker。

### 3.3 文件修改边界

计划内允许修改的主要区域：

- `src/style.css`
- `src/App.vue`
- `src/ui/views/EditorView.vue`
- `src/ui/components/**`
- 新增的 `src/ui/styles/**`
- 新增的纯展示 `src/ui/components/base/**`
- 新增的纯展示 `src/ui/composables/**`

允许对 `MapCanvas.vue` 做的修改仅限：

- 容器 class；
- aria 属性；
- 视觉外框；
- 容器层级；
- ResizeObserver 或既有尺寸同步所需的展示层接线。

不得修改 Canvas 绘制、Pointer 到网格坐标转换、编辑命令或 renderer 调用语义。

### 3.4 每个 Milestone 的统一质量门禁

每个 Milestone 合并前至少执行：

```text
npm run typecheck
npm run lint
npm run format:check
npm run test:run
npm run build
git diff --check
```

若使用 `npm run check`，仍需单独保留 `format:check` 与 `git diff --check` 结果。

浏览器验收要求：

- Chrome，主尺寸 1440×900；
- Full：≥1280；
- Compact：1100–1279；
- Overlay：900–1099，仅从 M2 起检查；
- 正常 Motion 与 `prefers-reduced-motion: reduce`，从 M6 起双轨检查；
- 浏览器 Console 无新增 warning/error；
- 每个 Milestone 使用同一组核心编辑数据和 Junction 压力场景；
- 截图必须标明 Milestone、viewport、状态和 commit。

---

## 4. 稳定契约清单

迁移 PR Review 时，应把下列事件视为公共 API。视觉重构不得改名、改参数、改成新的 Store 入口。

| 组件                      | 必须保持的 emits / 行为                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| `TopToolbar.vue`          | `undo`、`redo`、`validate`、`test-route`、`import`、`export`                                     |
| `ToolPalette.vue`         | `select-tool(tool)`                                                                              |
| `LevelTree.vue`           | `select-level(address)`、`create-level`、`duplicate-current`、`resize-current`、`delete-current` |
| `PropertyPanel.vue`       | `update-tower-locked`、`update-spawn-move-seconds-per-cell`、所有 Junction 转发事件              |
| `JunctionPanel.vue`       | `create`、`remove`、`entry-enabled`、`exit-enabled`、`exit-weight`                               |
| `ValidationPanel.vue`     | `focus-issue(issue)`                                                                             |
| `RoutePreviewOverlay.vue` | `stop`、`replay`、`close`                                                                        |
| `NewLevelDialog.vue`      | `create(spec)`、`cancel`                                                                         |
| `ResizeLevelDialog.vue`   | `resize(target)`、`cancel`                                                                       |
| `ImportDialog.vue`        | `close`、`import-level`、`replace-level`、`copy-level`、`replace-project`                        |
| `ExportDialog.vue`        | `close`、`export-game-config`、`export-project`                                                  |

允许新增内部展示事件，但不得要求 Store 新增 action 才能完成本计划。

---

# M1 Foundation

## 目标状态

建立唯一、可审查、可渐进迁移的视觉基础层：颜色、字体、间距、圆角、阴影、Glass、Motion、z-index、状态色和可访问性 token 集中定义；现有组件可通过兼容 alias 继续运行。

M1 完成后不追求全页面已经是 Liquid Glass。目标是让后续所有 UI 改动只消费统一 token，不再在组件中继续新增零散颜色和几何规则。

## 当前状态

- `src/style.css` 以浅色 token 为主。
- 多个组件 scoped style 内存在硬编码白色、浅灰、蓝色、圆角和 backdrop。
- 没有统一的 G0/G1/G2/G3 材质层。
- Hover、Press、Focus、Disabled、Error 状态缺少统一规范。
- 没有统一 Motion 与 Reduced Motion 基线。

## 涉及文件

- `src/style.css`
- `src/main.ts`，仅在需要引入新增样式入口时修改
- `src/App.vue`，仅在需要根容器 class 时修改

## 建议新增文件

- `src/ui/styles/tokens.css`
- `src/ui/styles/foundation.css`
- `src/ui/styles/glass.css`
- `src/ui/styles/motion.css`

M1 不新增 Vue 业务组件。

## 明确不允许修改的范围

- 不修改任何 Store、Domain、Editor、IO、Persistence、Renderer 文件。
- 不修改任何现有 emits。
- 不改变 EditorView 的布局行列。
- 不迁移 ToolPalette、Validation 或 Route Preview 的结构。
- 不对 `RenderTheme.ts` 做深色化。
- 不加入 SVG displacement 或任何 Optical Refraction。

## 实现步骤

1. 建立 Design System token 文件，按 Background、Text、Border、Accent、Status、Spacing、Radius、Typography、Motion、Z-index、Glass 分组。
2. 为现有 `--color-*` 变量建立临时兼容 alias，避免一次性修改全部组件。
3. 建立 G0/G1/G2/G3 的纯 CSS 材质 class，但本阶段只允许在根背景或审查用示例上验证，不批量套用。
4. 统一 `box-sizing`、字体栈、基础文字色、页面背景、scrollbar 与 `color-scheme`。
5. 建立统一 `:focus-visible` token 规则，确保后续控件可复用。
6. 定义 Disabled、Error 与 Status 的最低视觉差异要求。
7. 在 `motion.css` 中定义 duration/easing，并在 Reduced Motion media query 中把非必要运动降级。
8. 搜索并记录现有硬编码视觉值，生成后续 Milestone 的迁移清单；M1 不要求全部消除。

## 需要保持的现有行为

- 页面可正常启动与自动加载项目。
- 所有现有按钮、输入、Canvas 和 Dialog 功能保持。
- 快捷键、Undo/Redo、autosave、Validation、Preview 完全不变。
- Canvas 当前语义颜色不随根主题改变。

## 风险点

- 全局颜色或 `color-scheme` 可能改变原生 input/checkbox 外观。
- 全局字体或 line-height 可能导致工具栏、Inspector 和 Dialog 几何漂移。
- 旧变量直接改值可能使尚未迁移的组件出现低对比度。
- backdrop-filter 默认套用到大面积节点会提前引入性能问题。

控制方式：使用兼容 alias，先建立 token，再按 Milestone 逐组件切换；禁止在 M1 全局替换所有颜色。

## 浏览器验收方法

1. 以 1440×900 打开默认空白关卡。
2. 顺序 Tab 检查 TopToolbar、Level actions、ToolPalette 和 Dialog 控件焦点。
3. 对比 Enabled / Disabled 按钮，确认至少 opacity、文字或 surface 有明确差异。
4. 打开 New Level、Resize、Export，确认文字可读且未溢出。
5. 检查 Canvas 网格和语义色未被全局 filter 或 opacity 影响。
6. 在 DevTools 模拟 Reduced Motion，确认无功能差异。

## 截图验收状态

- `M1-01-default-1440x900`
- `M1-02-focus-visible-toolbar`
- `M1-03-enabled-disabled-controls`
- `M1-04-dialog-foundation`
- `M1-05-canvas-color-unchanged`

## 完成定义（Definition of Done）

- Design System 的全部基础 token 已集中定义并有注释。
- 后续 Milestone 不需要再创建第二套颜色、间距、圆角或 motion token。
- 旧组件通过兼容层保持可用，无布局或业务行为回归。
- Canvas RenderTheme 未修改。
- 所有质量门禁通过。
- 浏览器状态截图齐全，Console 无新增错误。
- M1 可以单独回滚，不影响数据与业务代码。

---

# M2 Editor Shell

## 目标状态

建立 Canvas-first 的桌面编辑器外壳：12px app margin、48px TopBar、三栏 Workspace、228px LevelPanel、弹性 Canvas、336px Inspector、32px StatusBar，并为后续浮动 ToolDock、Validation Drawer、Route Preview 和 Dialog 建立统一 overlay host 与 z-index 层。

M2 是结构迁移，不要求 ToolDock、Validation 和 Route Preview 已完成最终视觉。未迁移模块允许保留临时兼容布局，但必须明确标记，并不得阻塞编辑。

## 当前状态

- `EditorView.vue` 使用 `52px 1fr 48px 160px` 四行布局。
- LevelPanel / Canvas / Inspector 为 `240px 1fr 380px`，无 app margin 和主 gap。
- ToolPalette 与 Validation 永久占据全宽行。
- 没有 StatusBar 和统一 floating layer。
- 900–1279 的响应策略与设计系统不一致。

## 涉及文件

- `src/ui/views/EditorView.vue`
- `src/ui/components/TopToolbar.vue`
- `src/ui/components/MapCanvas.vue`，仅限容器接线
- `src/App.vue`
- `src/style.css`

## 建议新增文件

- `src/ui/components/StatusBar.vue`
- `src/ui/components/EditorPanelFrame.vue`，仅在能明显减少重复材质外壳时新增
- `src/ui/styles/editor-shell.css`

## 明确不允许修改的范围

- 不修改 `editorStore.ts`。
- 不修改 Canvas pointer/grid 逻辑。
- 不修改 Validation 或 Route Preview 状态机。
- 不在 M2 重写 ToolPalette、ValidationPanel、RoutePreviewOverlay 内部。
- 不做 Panel collapse 的持久化。
- 不修改 Renderer 或 RenderTheme。

## 实现步骤

1. 把 EditorView 拆分为 `TopBar / Workspace / StatusBar` 三个稳定布局区，不拆业务组件。
2. 创建 12px app inset 与 12px 主 gap。
3. 建立 1440×900 基线列宽：228px / minmax(0,1fr) / 336px。
4. 为 TopBar、LevelPanel、Inspector、StatusBar 套用 M1 材质层级，但不加入折射。
5. 新增 StatusBar，只消费现有只读状态：active tool、grid size、save state、validation summary；不得触发新的 Store action。
6. 建立 `canvas-stage`、`floating-ui-layer`、`drawer-layer`、`modal-layer` 的结构和 pointer-event 规则。
7. ToolPalette 与 ValidationPanel 在 M5 前保留兼容 host；不得让其覆盖 Canvas 关键操作区域。
8. 增加 Full / Compact / Overlay 三种 CSS 布局策略。
9. Overlay 模式的面板开合状态只放在 EditorView 本地 presentation state，不写 Store、不持久化。
10. 通过 ResizeObserver 或现有尺寸同步机制验证 Canvas 在列宽变化后仍正确重绘；不改坐标算法。

## 需要保持的现有行为

- Canvas 点击、拖动和坐标命中。
- 选择对象后 Inspector 同步更新。
- Level 切换。
- Dialog 打开时阻断背景 Pointer。
- Tool shortcuts、Undo/Redo、save status、validation gating。
- 当前 Panel 内部功能和滚动行为。

## 风险点

- Canvas 容器位置变化可能暴露坐标偏移或 DPR 问题。
- Overlay host 的 pointer-events 可能穿透到 Canvas。
- 336px Inspector 会放大 Junction 内容压力。
- Compact / Overlay 模式可能打乱键盘 Tab 顺序。
- 临时兼容的 Tool/Validation host 可能造成重复占位。

控制方式：先固定 1440×900，再逐一增加 breakpoint；每次几何变化都用网格四角和中心点做实际点击校验。

## 浏览器验收方法

1. 1440×900 测量 TopBar、Workspace、三栏和 StatusBar 几何。
2. 在 Canvas 左上、中心、右下分别放置或选择元素，确认点击网格无偏移。
3. 在 1280、1100、900 宽度检查 Full / Compact / Overlay。
4. 打开 Inspector 最长 Junction 状态，确认滚动只发生在 Inspector 内部。
5. 打开任一 Dialog，确认 Level、Canvas、Inspector、Tool 不响应 Pointer。
6. 检查页面无横向溢出、无双滚动条。

## 截图验收状态

- `M2-01-shell-default-1440x900`
- `M2-02-shell-object-selected`
- `M2-03-shell-junction-overflow`
- `M2-04-shell-compact-1200`
- `M2-05-shell-overlay-1000`
- `M2-06-shell-modal-blocking`

## 完成定义（Definition of Done）

- 1440×900 主几何达到设计系统目标或有已记录的 M5 临时兼容差异。
- Canvas 是第一视觉主体且实际编辑坐标正确。
- StatusBar 已存在并只读取现有状态。
- z-index 与 overlay host 有唯一来源。
- Full / Compact / Overlay 均可运行。
- 不存在 Store、Domain、Renderer 修改。
- 质量门禁和浏览器验收通过。

---

# M3 Base Controls

## 目标状态

建立统一 Base Control 层，并先迁移低风险、高复用表面：TopToolbar 和 New/Resize/Import/Export Dialog。所有控件拥有一致的 Default、Hover、Press、Focus、Active、Disabled、Error 状态。

## 当前状态

- 各组件直接使用原生 `button/input/checkbox` 并在 scoped CSS 内独立定义。
- Enabled 与 Disabled 可能视觉相同。
- Focus 依赖浏览器默认 outline。
- Dialog 的宽度、backdrop、radius、padding 与按钮层级不统一。
- 没有统一 IconButton、Popover 或 BaseDialog；Hover Tooltip 仅用于 M5 ToolDock。

## 涉及文件

- `src/ui/components/TopToolbar.vue`
- `src/ui/components/NewLevelDialog.vue`
- `src/ui/components/ResizeLevelDialog.vue`
- `src/ui/components/ImportDialog.vue`
- `src/ui/components/ExportDialog.vue`
- `src/ui/views/EditorView.vue`，仅限 More/Popover 接线或 Dialog host
- `package.json`、`package-lock.json`，仅在批准引入统一 Icon 库时

## 建议新增文件

- `src/ui/components/base/UiButton.vue`
- `src/ui/components/base/UiIconButton.vue`
- `src/ui/components/base/UiTextInput.vue`
- `src/ui/components/base/UiNumberInput.vue`
- `src/ui/components/base/UiCheckbox.vue`
- `src/ui/components/base/UiToggle.vue`
- `src/ui/components/base/UiPopover.vue`
- `src/ui/components/base/UiDialog.vue`
- `src/ui/components/base/UiProgressBar.vue`
- `src/ui/components/base/UiIcon.vue`
- `src/ui/styles/controls.css`

若引入 Lucide，只允许一个图标依赖；不得同时混入多个 Icon Pack。

## 明确不允许修改的范围

- 不把组件事件改成新的 v-model 或 Store action。
- 不改变 Dialog 提交、取消、冲突和危险动作的业务条件。
- 不改变 number input 的 commit 时机。
- 不修改 Import/Export 内容格式。
- 不迁移 JunctionPanel；其压力测试留到 M4。
- 不实现 Liquid Lens 动画和折射。

## 实现步骤

1. 定义 Base Control API，优先透传原生属性、aria、disabled、name、type 和键盘行为。
2. Button 只提供 Primary / Secondary / Ghost / Danger 四种 variant。
3. IconButton 统一 Compact / Normal / ToolDock 三种尺寸，并保留 `aria-label`。
4. Text/Number Input 统一 32px 高度、Focus Ring、Error 和 Disabled。
5. Number Input 明确区分临时输入值与 `change` commit；不得默认按每次 input 写 Store。
6. Checkbox 使用统一视觉但保留原生可访问 input。
7. 本阶段不使用 Hover Tooltip，也不使用 native `title` 替代；M5 ToolDock 是唯一例外，关键操作文字和状态信息保持可见。
8. UiDialog 统一 backdrop、focus entry、Escape、宽度、header/content/footer slot 与 `aria-modal`。
9. 先迁移 TopToolbar，再迁移四个 Dialog；每迁移一个组件立即做行为对照。
10. Import / Export 移入 TopBar More menu 时，外层菜单只调用原有 `import` / `export` emits。
11. 删除已确认不再使用的重复 scoped 控件样式，但不做业务模板重写。

## 需要保持的现有行为

- TopToolbar 全部六类事件与 disabled 条件。
- persistence 的 loading / saving / saved / error 可见状态信息。
- Undo/Redo 快捷键不受按钮替换影响。
- New Level 的默认章节/关卡/尺寸与创建校验。
- Resize 同尺寸时 Apply disabled，尺寸变化时 impact summary 保留。
- Import 的全部结果分支。
- Export 的两个独立导出行为。
- Modal 打开时背景不可操作。

## 风险点

- 包装原生 input 后遗漏 `valueAsNumber`、`change`、checked 或 disabled 透传。
- Dialog focus management 造成快捷键误触或关闭后焦点丢失。
- Icon-only 后可发现性下降；通过 `aria-label` 和可见上下文保证可访问性，M5 ToolDock 另提供局部 Hover Tooltip。
- Popover 与 Dialog z-index 冲突。
- Base component 过度抽象，反而要求业务组件配合重构。

控制方式：Base Control 保持薄封装；若某项行为无法自然透传，优先保留原生元素而不是扩展业务 API。

## 浏览器验收方法

1. 对 Button 四种 variant 检查 Default/Hover/Press/Focus/Disabled。
2. 键盘顺序遍历 TopToolbar，并用 Enter/Space 触发。
3. 验证 Undo/Redo disabled 与 enable 后行为。
4. 逐个打开 New/Resize/Import/Export Dialog；检查焦点进入、Escape、Cancel、背景阻断。
5. 用合法和非法 Number Input 值验证错误状态与提交边界。
6. 检查 IconButton 的 `aria-label`，并确认 persistence 状态与关键操作文字保持可见。

## 截图验收状态

- `M3-01-control-state-matrix`
- `M3-02-topbar-default`
- `M3-03-topbar-more-menu`
- `M3-04-new-level-dialog`
- `M3-05-resize-disabled-and-impact`
- `M3-06-import-conflict-dialog`
- `M3-07-export-dialog`

## 完成定义（Definition of Done）

- Base Controls 有稳定、最小、可复用 API。
- TopToolbar 和四个 Dialog 已消费 Base Controls。
- Enabled 与 Disabled 可视觉区分，Focus Visible 清楚。
- Dialog 行为和 emits 与迁移前一致。
- 未修改 Store、Domain、IO 契约。
- 无第二套按钮、输入、Dialog 视觉规则继续新增。
- 质量门禁和截图验收通过。

---

# M4 LevelPanel / Inspector / Junction

## 目标状态

完成左右信息面板的 G1 迁移：LevelPanel 高密度、低干扰；Inspector 使用 Section 与 PropertyRow；Junction Inspector 在 336px 宽度下仍完整、可理解、可键盘操作。

Junction Inspector 是 M4 的发布门禁和复杂 UI 压力测试。只要 Junction 仍存在信息遗漏、错误禁用、滚动失控或权重提交回归，M4 不得完成。

## 当前状态

- LevelPanel 项目标题与四个常驻操作拥挤，项目名会换行。
- Active Level 使用大面积实心 cyan。
- Inspector 简单对象尚可，但缺少明确 section hierarchy。
- Junction 为重复卡片结构，长列表、disabled reason、权重输入混杂。
- Inspector 当前宽 380px；目标为 336px。

## 涉及文件

- `src/ui/components/LevelTree.vue`
- `src/ui/components/PropertyPanel.vue`
- `src/ui/components/JunctionPanel.vue`
- `src/ui/views/EditorView.vue`，仅限面板 props / presentation state 接线
- `src/ui/components/ResizeLevelDialog.vue`，仅当 Level More menu 影响入口时

## 建议新增文件

- `src/ui/components/InspectorSection.vue`
- `src/ui/components/PropertyRow.vue`
- `src/ui/components/LevelActionsMenu.vue`
- `src/ui/components/DeleteLevelDialog.vue`
- `src/ui/components/JunctionDirectionRule.vue`，仅用于拆分展示，不承载业务计算
- `src/ui/styles/editor-panels.css`

不得把 `JunctionPanel` 的状态计算迁移到新 Store 或新 Domain 服务。

## 明确不允许修改的范围

- 不修改 `getProjectChapters`、Level 排序、地址模型或删除规则。
- 不修改 `getJunctionEditorState`、Direction 模型或 Junction Editor。
- 不改变任一 existing emit。
- 不改变 Spawn timing 和 Junction weight 的 commit 时机。
- 删除仍必须二次确认，但 Presentation 从 LevelTree Header 内 inline confirmation 迁移为统一 Modal Confirm Dialog。
- Delete disabled 规则保持；Cancel 不修改项目状态。
- 不修改 Canvas selection model。
- 不修改 RenderTheme。

## 实现步骤

1. 把 LevelTree 的视觉职责迁移为 LevelPanel，但保留组件或建立兼容 facade，避免大范围 import 改名。
2. Panel Header 只常驻项目名和 `+`；Duplicate / Resize / Delete 放入 More menu。
3. More menu 中 Duplicate / Resize 直接触发原有 emit；Delete 打开统一 Modal Confirm Dialog，Confirm 后仍触发现有 `delete-current` / `editorStore.deleteCurrentLevel`，Cancel 不修改项目状态。
4. Level Item 实现 Default/Hover/Active/Disabled，Active 使用 soft surface + accent dot，不用实心蓝底。
5. PropertyPanel 用 InspectorSection / PropertyRow 统一 Type、Position、ID、Spawn timing、Tower locked。
6. Empty State 保持安静，不加入大插画或主按钮。
7. Junction Summary 分为 BASIC、CONNECTIONS、DANGER ZONE。
8. 每个 entry direction 保留原生 checkbox、disabled reason、exit list、weight sum 和 weight input。
9. 用低层级分隔线和 indentation 代替重复大卡片；不得隐藏错误说明。
10. Inspector 内只允许一个垂直滚动容器，Header 和必要的危险操作不能与页面滚动竞争。
11. 在 336px 和 Compact 300px 两个宽度完成压力测试。

## 需要保持的现有行为

- Level 切换与 chapter group。
- New / Duplicate / Resize / Delete 的现有 emits。
- 至少保留一个 Level 时 Delete disabled。
- 删除的二次确认语义与 Delete disabled 规则；确认界面改为统一 Modal Confirm Dialog。
- Path / Spawn / End / Tower 的属性内容。
- Tower locked checkbox。
- Spawn timing 合法值提交、非法值忽略。
- Junction candidate、create、remove。
- Entry/Exit role 冲突、disabled reason。
- 权重和提示、权重输入和现有更新事件。

## 风险点

- 把 action 收入菜单后降低可发现性或键盘可达性。
- Junction 展示拆分时误把 computed 逻辑复制到子组件。
- 336px 下文本截断导致 disabled reason 不可读。
- 自定义 Checkbox/NumberInput 改变 change 行为。
- Danger Zone 视觉过强，破坏专业工具的克制感。

控制方式：数据和计算仍由现有组件/工具函数提供；新增组件只接受已计算 props 并转发事件。

## 浏览器验收方法

1. 检查单章节、多章节、多关卡 Level Tree。
2. 检查 Level Default/Hover/Active，以及 More menu 的键盘导航。
3. 打开 New、Duplicate、Resize、Delete 两步确认，确认每个入口仍对应原行为。
4. 依次选择 Path、Spawn、End、Tower，验证属性完整。
5. 创建四向 Junction，覆盖：候选、未配置、有效配置、0 权重、权重和非 1、方向冲突、disabled reason、删除。
6. 在 336px 与 300px Inspector 宽度滚动，确认无横向溢出。
7. 修改 Junction 后检查 Undo/Redo、Validation stale、autosave。

## 截图验收状态

- `M4-01-level-panel-default`
- `M4-02-level-active-hover-menu`
- `M4-03-inspector-empty`
- `M4-04-inspector-spawn`
- `M4-05-inspector-tower`
- `M4-06-junction-candidate`
- `M4-07-junction-valid-complex`
- `M4-08-junction-invalid-weight`
- `M4-09-junction-disabled-reasons-300px`
- `M4-10-junction-danger-zone`

## 完成定义（Definition of Done）

- LevelPanel 与 Inspector 达到 G1 层级和目标密度。
- LevelPanel 不再常驻四个操作按钮。
- 简单属性与 Junction 均使用统一 section/property 语言。
- Junction 全状态在 336px 和 300px 下可操作。
- 所有 emits、commit 时机和现有 Store 行为保持。
- Junction 压力测试、Undo/Redo、Validation stale、autosave 全部通过。
- 质量门禁和截图验收通过。

---

# M5 ToolDock / Validation / Route Preview

## 目标状态

完成 Canvas 周边的任务型交互层：ToolPalette 迁移为 Canvas 内底部居中的 G2 ToolDock；Validation 迁移为 StatusBar 摘要 + Bottom Drawer；Route Preview 迁移为 Canvas 右上 G2 面板并增加 ProgressBar。

M5 完成后，1440×900 的主要结构应与 Design System 基线一致，不再保留 48px 全宽工具栏或 160px 固定 Validation 区域。

## 当前状态

- ToolPalette 是全宽 48px 固定行，文字按钮较宽，Active 是实心蓝。
- ValidationPanel 永久占据 160px。
- Route Preview 为白色、近乎不透明的 256px 卡片，仅文字进度。
- Validation 和 Preview 的状态行为已经成熟，应只迁移 presentation。

## 涉及文件

- `src/ui/components/ToolPalette.vue`
- `src/ui/components/ValidationPanel.vue`
- `src/ui/components/RoutePreviewOverlay.vue`
- `src/ui/components/StatusBar.vue`
- `src/ui/views/EditorView.vue`
- `src/ui/routePreview/useRoutePreviewPlayback.ts`，原则上不改；只有展示接口确有缺失时先停下来评审

## 建议新增文件

- `src/ui/components/ValidationDrawer.vue`，也可由 `ValidationPanel.vue` 保留兼容名称直接转型
- `src/ui/components/ValidationSummary.vue`
- `src/ui/components/ToolDockItem.vue`
- `src/ui/components/RoutePreviewProgress.vue`，优先复用 `UiProgressBar`
- `src/ui/styles/floating-editor-ui.css`

为降低 import churn，优先保留 `ToolPalette.vue`、`ValidationPanel.vue`、`RoutePreviewOverlay.vue` 文件名与 emits，只改变展示职责。

## 明确不允许修改的范围

- 不改变工具枚举、快捷键或 `select-tool` 参数。
- 不修改 Validation 规则、issue code、severity 或状态机。
- 不修改 Route Simulator 或 Playback 的时间语义。
- 不修改 Preview 门禁和 start/stop/replay/close Store action。
- 不修改 Validation focus 到 Canvas 的行为。
- 不修改 Canvas Renderer。
- 不加入 Liquid Lens 动画或折射；M5 只完成静态/基础过渡版。

## 实现步骤

1. 将现有 ToolPalette 置入 `floating-ui-layer`，改为约 300×44 的 ToolDock。
2. 工具项使用 36×36 IconButton，保留包含快捷键的 aria-label 与快捷键 1–6；局部 Tooltip 只显示工具名，不使用 native title。
3. Active Tool 先使用静态 G3 soft indicator，不在 M5 实现 stretch/spring。
4. StatusBar 右侧显示 Validation 摘要；点击后切换 Validation Drawer。
5. Validation not-run / stale / passed 默认不占大空间；failed/warning 通过摘要提示。
6. Drawer 高 240–320px、最大 40% Canvas；保留 issue list 全部字段与 focus 行为。
7. Drawer 与 Dialog 不同时作为主交互层；Dialog 打开时 Drawer 不抢焦点。
8. Route Preview 保留现有状态数据和 emits，重排为 Spawn、Target、Time、Progress、Status、Actions。
9. 新增 3px ProgressBar，只读取已有 progress，不创造新播放状态。
10. 处理 ToolDock、Drawer、Preview 同时可见时的 z-index、遮挡和 pointer-event。

## 需要保持的现有行为

- 工具切换和快捷键 1–6。
- 当前工具状态。
- Validation not-run/stale/passed/failed。
- Issue count、severity、title、description、coordinates、code。
- Issue 点击聚焦 Canvas。
- Preview 校验门禁。
- Preview playing/completed/stopped/replay/close。
- Spawn ID、End ID、时间、进度、步数与停止结果。

## 风险点

- Validation 从常驻区改为 Drawer 后，用户可能错过错误。
- ToolDock 浮在 Canvas 上可能遮挡底部网格或吞掉 Pointer。
- Preview 与 Inspector/ToolDock/Drawer 同时出现时可能相互覆盖。
- Drawer 关闭后焦点恢复不正确。
- ProgressBar 插值与实际 Playback 状态不一致。

控制方式：StatusBar 始终保留明确的 error/warning 数量；浮动层只在自身几何范围接收 Pointer；进度值只读现有数据。

## 浏览器验收方法

1. 空白默认态确认 ToolDock 居中且不遮挡关键网格。
2. 依次切换 6 个工具并使用键盘快捷键。
3. 产生 not-run、stale、passed、failed 四类 Validation 状态。
4. 打开错误 Drawer，点击每个可定位 issue，确认 Canvas focus。
5. 运行 Preview，截取 playing、completed、stopped、replay。
6. 同时显示 Preview、Validation Drawer 和复杂 Junction Inspector，检查层级与可操作性。
7. 打开 Dialog，确认 ToolDock/Drawer/Preview 暂停响应。

## 截图验收状态

- `M5-01-tooldock-select-active`
- `M5-02-tooldock-each-tool`
- `M5-03-validation-status-not-run-stale-passed`
- `M5-04-validation-drawer-errors`
- `M5-05-validation-focused-issue`
- `M5-06-preview-playing`
- `M5-07-preview-completed`
- `M5-08-preview-stopped`
- `M5-09-preview-plus-drawer-plus-junction`
- `M5-10-modal-interaction-blocking`

## 完成定义（Definition of Done）

- 全宽 ToolPalette 行和固定 160px Validation 行已消失。
- ToolDock、StatusBar、Validation Drawer、Route Preview 达到目标静态结构。
- Validation 与 Preview 的全部既有状态和事件保持。
- Canvas 可用面积明显增加且坐标无回归。
- 浮动层无 pointer 穿透、焦点丢失或层级冲突。
- 质量门禁和浏览器验收通过。

---

# M6 Liquid Motion

## M6 实施状态（2026-09-30）

本轮已接入共享 Tool Lens（拉伸、移动、轻微越位与稳定）、共享 Level Active Indicator、ToolDock 局部 Tooltip 淡入淡出，以及 Validation Drawer、Route Preview、UiDialog 和 UiPopover 的双向进出场。Drawer 打开时 ToolDock 通过 transform 同步上移。所有运动使用统一时长和 easing token，并通过 `prefers-reduced-motion` 直接到达相同终态；业务事件仍立即执行。

Toggle / Slider 当前无真实消费者，本轮未实现。Desktop side-panel collapse 当前不存在产品状态，本轮未新增。Optical Refraction 仍属于 M7。M6 正式浏览器验收留待后续，实施完成不等于里程碑关闭。

## 目标状态

在 M1–M5 已稳定的布局和控件之上增加有意义的 Motion：Tool active lens、Level active indicator、Toggle/Slider thumb、Panel/Drawer/Dialog、Popover 和 Route Preview 的状态过渡。

M6 只实现运动语言，不实现 Optical Refraction。

## 当前状态

- 当前 UI 几乎没有统一动画。
- Active 状态直接切换。
- Panel、Drawer、Dialog 和 Preview 缺少一致的进入/退出节奏。
- 没有系统化 Reduced Motion 验收。

## 涉及文件

- `src/ui/styles/motion.css`
- `src/ui/components/ToolPalette.vue`
- `src/ui/components/LevelTree.vue`
- `src/ui/components/ValidationPanel.vue`
- `src/ui/components/RoutePreviewOverlay.vue`
- `src/ui/components/base/UiDialog.vue`
- `src/ui/components/base/UiPopover.vue`
- `src/ui/views/EditorView.vue`，仅限 collapse/drawer presentation state

## 建议新增文件

- `src/ui/components/base/UiLiquidIndicator.vue`
- `src/ui/composables/useLiquidIndicator.ts`，仅在 CSS 无法稳定计算 indicator 几何时新增
- `src/ui/composables/useReducedMotion.ts`，优先用 CSS media query，确需 JS 分支时才新增

## 明确不允许修改的范围

- 不加入 displacement map、SVG filter 或折射。
- 不为动画修改 Store 状态机。
- 不用 animation callback 决定业务完成。
- 不延迟 Validation、Preview、Undo/Redo 或 autosave 的逻辑提交。
- 不做大幅 bounce、全屏 blur 动画或无限循环动画。
- 不让 Canvas 内容参与 Liquid 形变。

## 实现步骤

1. 为 Hover/Press、Input/Popover、Panel/Drawer、Liquid、Dialog 分配统一 duration/easing。
2. Tool active indicator 实现 Stretch → Move → Small Overshoot → Settle；按钮本身保持真实可点击元素。
3. Level active indicator 纵向滑动，但 DOM 顺序与焦点顺序不改变。
4. Drawer、Dialog、Route Preview 使用 transform + opacity；退出短于进入。
5. Popover 使用短距离位移与 fade。
6. Toggle/Slider 如已投入使用，再添加 thumb motion；未使用的组件不为展示而强行加入页面。
7. Panel collapse 使用 220ms，并保证 Canvas 只在布局稳定点重新测量。
8. Reduced Motion 下禁用 stretch/overshoot，只保留必要 fade 和状态切换。
9. 动画结束不触发 Store action；中途切换或快速重复点击仍以当前状态为准。

## 需要保持的现有行为

- 所有点击立即触发原有事件，不等待动画。
- 快速工具切换最终状态准确。
- Drawer、Dialog、Preview 的 open/close 状态准确。
- Preview 播放计时不受 CSS 动画影响。
- Keyboard focus 不因 moving indicator 丢失。
- Reduced Motion 下所有功能完整。

## 风险点

- Indicator 位置依赖测量，Resize/字体变化后可能错位。
- 快速切换产生过期 animation callback。
- Panel collapse 与 Canvas ResizeObserver 形成重复布局。
- filter/box-shadow 动画引发重绘。
- Reduced Motion 仅关闭部分动画，造成体验不一致。

控制方式：以 transform/opacity 为主；Indicator 为 presentation-only；任何 callback 都不得决定业务状态。

## 浏览器验收方法

1. 慢速录制连续切换 1–6 工具，检查 indicator 跟随和最终状态。
2. 快速来回切换工具至少 20 次，确认无错位、残影、失焦。
3. 连续切换多个 Level，确认 active indicator 正确。
4. 快速开关 Validation Drawer、Dialog、Route Preview。
5. 切换 Reduced Motion，重复上述流程。
6. 浏览器 Performance 面板观察动画期间 Layout/Paint，避免持续长任务。

## 截图验收状态

静态截图无法证明完整运动，因此截图记录稳定端点，另附短视频或帧序列作为补充证据。

- `M6-01-tool-lens-resting-select`
- `M6-02-tool-lens-resting-tower`
- `M6-03-level-indicator-resting`
- `M6-04-drawer-open-end-state`
- `M6-05-dialog-open-end-state`
- `M6-06-reduced-motion-end-states`

## 完成定义（Definition of Done）

- Motion 仅表达状态、层级和焦点，不改变业务时序。
- Tool/Level/Drawer/Dialog/Preview 动画使用统一 token。
- Reduced Motion 有完整降级路径。
- 快速交互没有 stale callback、错位或焦点丢失。
- 无明显布局抖动和持续高成本动画。
- 质量门禁、截图和运动录制验收通过。

---

# M6.5 Canvas Dark Theme

## 目标状态

在 M6 与 M7 之间，将 Canvas Host、Grid 和现有地图语义色适配到最终深色背景。保留 Path 蓝、Spawn 绿、End 红、Tower 琥珀、Junction 紫/橙/红、Validation 红/黄及 Route Preview 青色的角色；Selection 颜色由 `RenderTheme` 提供。

## 修改边界

Dark Canvas 首轮仅调整 `RenderTheme` 视觉值、Selection theme 接线、`MapCanvas.vue` 的样式和本计划文档。Canvas Host 使用 `--bg-canvas`，Grid Surface 略亮于 Host。Renderer 数值参数、绘制顺序、Viewport、Pointer/Grid、DPR、ResizeObserver、业务状态和 M6 Motion 保持不变；Canvas 不使用 Glass 或 Optical Refraction。

## Semantic Marker Calibration

M6.5 的后续 Marker pass 将 Spawn 绘制为绿色圆形底形加 MapPin-like 线图标、End 绘制为红色圆形底形加 Flag-like 线图标、Tower 绘制为琥珀色圆角方形底形加 Castle-like 线图标、Locked Tower 绘制为灰色圆角 Tower 加小锁。颜色仍负责快速分类，图标负责精确识别；小 Cell 优先保留底形。绘制使用 Canvas primitive，不引入 Vue 图标组件或依赖。

本次 Marker pass 只改 Node 的纯视觉表现；Path、Grid、Junction、Selection、Validation 和 Route Preview 不调整。Node 遍历、坐标、命中、Renderer 顺序及 M7 范围保持不变。

### Visual Revision

保留 `NodeRenderer → MarkerGlyphRenderer → RenderTheme` 架构，仅修订 Marker Visual Recipe：由彩色实心底形加浅色小图标，改为暗色中性底形、语义色外框和更大、更简洁的同色图标。Spawn 使用绿色 Pin，End 使用红色 Flag，Tower 使用琥珀色塔形，Locked Tower 使用灰色塔形和右上角的小琥珀锁；小 Cell 逐级省略内部细节。此修订仍需单独浏览器视觉验收，M7 保持暂停。

### Visual Polish

保持既有色板和 Marker 尺寸，让暗色底形保持实色、语义外框降低透明度、内部图标保持全强度。Spawn 与 End 外框使用 0.52 alpha，Tower 使用 0.42，Locked Tower 使用 0.38。Tower 图标改为较大的简化塔冠、塔身和门洞；普通与锁定塔位共用这套图形。锁提示缩小并保持右上角，小 Cell 继续降级为琥珀色点或省略。正式浏览器验收仍待进行，M7 保持暂停。

### Final Marker Polish

保持既有色板和 Marker 总尺寸，进一步将 Spawn、End、Tower、Locked Tower 外框 alpha 分别降至 0.38、0.38、0.28、0.24，使 Pin、Flag、Tower 图形成为主视觉。Tower 改为上宽下窄的塔冠、塔身和小门洞，普通与锁定塔位继续共用同一绘制函数；右上角琥珀锁缩至 Tower 底形的 0.16，仅作为次要状态提示。M6.5 正式浏览器验收尚未完成，M7 保持暂停。

## 验收门禁

实施阶段执行 typecheck、lint、format:check、test:run、build 与 `git diff --check`。正式浏览器视觉和指针验收单独进行；实施完成不代表 M6.5 里程碑关闭。验收覆盖 Grid、Path、各 Marker、Selection、Validation、Route Preview、复杂 Junction、目标 viewport、高 DPR 和 Canvas 四角指针准确性。M6.5 的视觉对比与指针回归通过后才可进入 M7。

---

# M7 Optical Refraction / Performance

## M7A Tool Lens Refraction Prototype（2026-09-30）

### 当前授权与状态

按 M7A 执行计划，M1–M6.5 CLOSED，M6.5 baseline frozen，基线为 `ebdfba85ab1750f688edefbbbd6a14e7ff766236`。M7A started；本节是当前状态，前文 M6 / M6.5 的暂停和待验收文字保留为历史记录，不代表本轮重新进行这些阶段的验收。

本轮仅实现 Tool shared active lens：`UiLiquidIndicator variant="tool"` 的 Surface。M7B NOT STARTED；M7C NOT STARTED。下方 M7 总体涉及文件、扩展步骤、性能预算和浏览器矩阵仅为后续规划，均不属于本轮执行范围；不得由此扩散到 ToolDock、Route Preview、Primary Action 或其他消费者。

### 实现与完整回退

- 原有 `--glass-g3-background`、`--glass-g3-border`、`--shadow-liquid` 始终保留，Full 只叠加增强。ToolDock G2、Level Indicator、图标颜色与层级不变。
- Tool Surface 新增两个纯 CSS 伪元素：`::before` 通过 `backdrop-filter: url(...)` 对后方采样进行真实位移运算，`::after` 提供静态左上边缘高光。未使用普通 `filter` 扭曲前景或以 blur/gradient 冒充折射。
- `src/ui/assets/filters/liquid-refraction.svg` 只有 `feTurbulence` 与 `feDisplacementMap` 两个节点。低频单 octave，固定 seed 7，scale 3，R/G 通道：静止时每轴理论最大偏移 ±1.5 CSS px，二维最大约 2.12px；现有 1.16 倍横向 stretch 下二维上界约 2.30px。实际可见强度待浏览器确认。
- Filter region 四侧各扩展 20%。Surface 使用圆角与 `overflow: hidden` 裁切 optical children，自身原有外阴影仍由 Surface 绘制。没有扩大布局、点击区域或测量尺寸。
- 高光采用 inset shadow，左上 alpha 0.16、右下 alpha 0.04，方向和参数固定。没有鼠标追踪、噪声覆盖、放大、RGB split 或滤镜动画。
- 两个伪元素均 `pointer-events: none`，沿用 Indicator 的 `aria-hidden="true"`；Tool Button / Icon 是 z2 的兄弟节点，不在 filtered subtree 中，Lens 保持 z1、Tooltip 保持 z3。
- 仍只有一个共享 Tool Lens、一个背景滤镜消费者；没有新增 DOM、组件、工具函数、业务状态、依赖或每帧光学参数更新。

### Capability 与开发级强制回退

CSS `@supports` 检查实际使用的 `backdrop-filter: url(...)` / `-webkit-backdrop-filter: url(...)` 语法，增强只在 gate 内定义；两种属性均提供。没有 UA、浏览器版本、OS/GPU 分支或 JS capability helper。

`@supports` 不能检测 SVG 资源加载成功、具体 primitive 的执行能力或实际 backdrop 渲染。因此通过语法 gate 不等于 Full 已获验收；SVG 忽略/失败时底层 G3 仍保留，但 gate 内的静态高光可能继续存在。严格对比当前 G3 时，使用强制回退 hook 同时移除两个伪元素。Safari / Firefox / Chrome 的 Full 能力均不得仅凭静态检查宣布通过。

后续在 DevTools 给 `html`、`body`、应用 root 或 Tool Indicator 添加 `data-visual-refraction="off"` 即可禁用两个增强层；移除属性恢复自动 gate。此 hook 不接 Store、设置 UI、localStorage 或 persistence，不需要修改 EditorView。

CSS URL 使用 Vite 管理的相对 SVG asset 和 `?no-inline`，保留 `#tool-lens-refraction` fragment，生产构建应输出独立哈希 SVG 文件；不使用本地磁盘 URL 或 Data URI。构建解析通过仍不代表浏览器已加载并执行该滤镜。

### Motion 与冻结边界

Outer `translate3d`、Inner `scaleX`、280ms 时长、rapid retarget 与 geometry 完全沿用 M6；未修改 `ToolPalette.vue`、`useLiquidIndicator.ts`、`motion.css` 或 `UiLiquidIndicator.vue`。Reduced Motion 保留原有零时长和 stretch 禁用规则，静态折射/高光可以保留。没有新增 JS Reduced Motion 分支。

ToolDock、Level Indicator、TopBar、Inspector、Validation、Route Preview、Dialog、Popover、Input、Canvas、Renderer、Store、Domain、IO 和 Persistence 均不改动。未创建 `UiRefractionSurface.vue`、`useVisualCapability.ts` 或 Performance Budget 文档。

### 验证与阶段退出

本轮 typecheck、lint、format:check、test:run、build 和 `git diff --check` 全部通过；29 test files / 174 tests 全绿且未减少。生产构建输出独立 `liquid-refraction-CKtaPQmt.svg`，内容与源 SVG 一致；构建 CSS 的两种 backdrop 属性均保留 `#tool-lens-refraction`，无 Data URI 或残留 `?no-inline`。冻结文件边界检查通过，变更仅为本样式文件、本计划文档和新增 SVG。

M7A Implementation DONE 仅表示静态折射运算路径、Fallback 与边界实现完成。Browser Validation PENDING / NOT PERFORMED BY DESIGN；Performance Validation NOT PERFORMED BY DESIGN。本轮不截图、不录屏、不做 Full/Fallback 人工视觉判定、多浏览器测试或 GPU/Performance trace，不声称 60fps、无 Paint 回归或性能通过。M7 milestone closed: NO。

下一轮必须确认 Full 真实背景位移、折射克制、图标清晰、Lens motion、快速 1→6→2→5、Fallback 与原 G3 一致、Reduced Motion、圆角裁切、资源加载和 Console、无明显卡顿；通过后另行授权才能进入 M7B。M7C 的性能预算和最终验收仍未开始。

## 目标状态

在基础视觉、布局、控件和运动均稳定，且 M6.5 Dark Canvas Theme 已验收锁定后，为白名单内的小型 G2/G3 控件增加可渐进增强的 Optical Refraction；不支持完整能力时自动降级为 Blur + Transparent Surface + Border Highlight + Shadow。M7 不再承担 Canvas palette 重设计。

M7 是增强层，不是完成基础 UI 的前置条件。

## 当前状态

- M1–M6 提供稳定的暗色 Glass 与 Motion，但不依赖真实折射。
- 设计系统允许的折射范围有限：Tool Active Lens、Toggle/Slider thumb、Primary Action、Floating ToolDock、Route Preview Control。
- Canvas、Inspector 大面积背景、Validation List、普通 Input 和普通 Error 禁止使用 Liquid Refraction。

## 涉及文件

- `src/ui/styles/glass.css`
- `src/ui/styles/motion.css`
- `src/ui/components/base/UiLiquidIndicator.vue`
- `src/ui/components/ToolPalette.vue`
- `src/ui/components/RoutePreviewOverlay.vue`
- 经过白名单批准的 Primary Action / Toggle / Slider

## 建议新增文件

- `src/ui/components/base/UiRefractionSurface.vue`
- `src/ui/composables/useVisualCapability.ts`
- `src/ui/assets/filters/liquid-refraction.svg`，仅当实现方案确需静态 SVG filter
- `docs/ui/performance/TDPE_UI_Performance_Budget.md`

优先使用 CSS `@supports` 完成能力检测；只有 CSS 无法覆盖时才增加 JS capability composable。

## 明确不允许修改的范围

- 不把折射应用到 Canvas。
- 不把折射应用到 LevelPanel、Inspector、Validation list、普通 input 或每个 list item。
- 不修改 RenderTheme。
- 不修改交互状态机或增加业务 loading。
- 不在鼠标移动时重算整个面板 displacement map。
- 不允许无限循环、高强度 glow 或大面积多层 blur。
- Fallback 不能失去边界、Focus、Active 或可读性。

## 实现步骤

1. 建立 Full / Fallback 两级视觉能力矩阵。
2. 先在 Tool Active Lens 单点验证 refraction，不同时扩散到多个组件。
3. 验证后依次扩展到 ToolDock surface、Route Preview 关键控制、少量 Primary Action。
4. 每增加一个应用点，记录面积、filter 数量、动画属性和 fallback。
5. 用 `@supports` 或 capability class 切换，不让 unsupported browser 出现不可见内容。
6. Reduced Motion 下关闭 lens stretch 和 overshoot，但静态材质可保留。
7. 在 Junction 长列表与 Validation Drawer 同时打开时测量滚动和输入响应。
8. 在 Preview 播放期间测量主线程、Layout、Paint、Composite 和长任务。
9. 超出性能预算时，优先降低 refraction/blur，不能牺牲文字对比度、Canvas 清晰度或交互响应。
10. 完成无 Refraction 的强制 fallback 验收。

## 需要保持的现有行为

- M1–M6 的全部交互与可访问性行为。
- Canvas 清晰度与语义色。
- Tool、Validation、Preview、Dialog 的 Pointer 和 Focus 层级。
- Reduced Motion 功能完整。
- 浏览器不支持折射时仍可完整操作。

## 风险点

- SVG/CSS filter 造成 GPU、Paint 或内存压力。
- 多层 backdrop-filter 在复杂 Junction/Drawer 场景下降帧。
- 折射削弱文字、Icon 或状态色对比度。
- 不同 Chrome/GPU 环境渲染差异。
- capability detection 失败导致 Full/Fallback 状态混合。

建议性能预算：

- 正常 Tool/Level 切换无可感知卡顿；
- 动画期间不出现持续性 >50ms 主线程长任务；
- Junction Inspector 滚动与 Number Input 输入保持即时响应；
- Preview 播放期间 Canvas 更新不因 UI filter 明显降帧；
- Fallback 与 Full 的布局差异不超过 1px；
- 禁用 Refraction 后功能、尺寸和焦点顺序完全一致。

## 浏览器验收方法

1. Chrome Full 能力下检查 Tool Lens、ToolDock、Route Preview Control。
2. 强制关闭 refraction/filter，检查 Fallback。
3. 在 1440×900 同时打开复杂 Junction、Validation Drawer、Route Preview。
4. 连续工具切换、Drawer 开关和 Preview 播放，记录 Performance trace。
5. Reduced Motion + Fallback 组合验收。
6. 检查高 DPI 与普通 DPR，不允许边缘裁切或文字模糊。
7. 检查 Console，无 SVG/filter/capability 错误。

## 截图验收状态

- `M7-01-full-refraction-tool-lens`
- `M7-02-full-refraction-preview`
- `M7-03-fallback-tool-lens`
- `M7-04-fallback-preview`
- `M7-05-complex-junction-drawer-preview`
- `M7-06-reduced-motion-fallback`
- `M7-07-high-dpi-edge-quality`

## 完成定义（Definition of Done）

- Refraction 只出现在批准白名单内。
- Full 与 Fallback 均完整可用，布局和可访问性一致。
- Canvas、Inspector、Validation List 不使用高成本 Liquid filter。
- 达到性能预算；Performance trace 和结论随 PR 提供。
- Reduced Motion 与 unsupported browser 验收通过。
- 质量门禁、截图和性能证据完整。

---

## 5. 跨 Milestone 浏览器回归矩阵

每个 Milestone 不必重拍所有最终视觉，但必须重跑下列行为矩阵：

| 场景                       |  M1  |  M2  |  M3  |  M4  |  M5  |  M6  |  M7  |
| -------------------------- | :--: | :--: | :--: | :--: | :--: | :--: | :--: |
| 默认空白编辑态             |  ✓   |  ✓   |  ✓   |  ✓   |  ✓   |  ✓   |  ✓   |
| 工具点击与 1–6 快捷键      |  ✓   |  ✓   |  ✓   |  ✓   |  ✓   |  ✓   |  ✓   |
| Path/Spawn/End/Tower 选择  |  ✓   |  ✓   |  ✓   |  ✓   |  ✓   |  ✓   |  ✓   |
| Junction 复杂状态          | 抽查 |  ✓   |  ✓   | 必测 | 必测 | 必测 | 必测 |
| Undo/Redo                  |  ✓   |  ✓   |  ✓   |  ✓   |  ✓   |  ✓   |  ✓   |
| autosave 状态              |  ✓   |  ✓   |  ✓   |  ✓   |  ✓   |  ✓   |  ✓   |
| Validation 四状态          |  ✓   |  ✓   |  ✓   |  ✓   | 必测 | 必测 | 必测 |
| Validation issue focus     |  ✓   |  ✓   |  ✓   |  ✓   | 必测 | 必测 | 必测 |
| Route Preview 全状态       |  ✓   |  ✓   |  ✓   |  ✓   | 必测 | 必测 | 必测 |
| New/Resize/Import/Export   |  ✓   |  ✓   | 必测 |  ✓   |  ✓   |  ✓   |  ✓   |
| 1440×900                   |  ✓   | 必测 | 必测 | 必测 | 必测 | 必测 | 必测 |
| Compact / Overlay          |  —   | 必测 |  ✓   |  ✓   |  ✓   |  ✓   |  ✓   |
| Reduced Motion             | 基线 | 基线 | 基线 | 基线 | 基线 | 必测 | 必测 |
| Full / Fallback Refraction |  —   |  —   |  —   |  —   |  —   |  —   | 必测 |

“抽查”不能替代任何状态机相关的自动测试；“必测”需要截图或录屏证据。

---

## 6. Milestone 退出与回滚规则

出现以下任一情况，不得继续进入下一 Milestone：

- 需要修改 Store / Domain / Renderer 才能完成视觉目标；
- emit 或 Store action 被改名、合并或改变参数；
- Undo/Redo 或 autosave 出现行为变化；
- Validation stale / gate 行为发生变化；
- Route Preview 状态或计时发生变化；
- Junction disabled reason、方向冲突或权重提交丢失；
- Canvas 坐标在任一目标 viewport 偏移；
- Dialog 背景仍能编辑 Canvas；
- Enabled/Disabled/Focus 不能可靠区分；
- 浏览器截图与本 Milestone DoD 不一致；
- 静态检查、测试或 build 未通过。

回滚应以整个 Milestone PR 为单位。不得通过在下一 Milestone 添加临时补丁来掩盖上一阶段未完成的回归。

---

## 7. 推荐 PR / Commit 切分方案

推荐每个 Milestone 一个独立 PR。每个 PR 保持 1–3 个可审查 commit，避免把视觉、结构、运动和性能混入同一个提交。

### PR 1 — M1 Foundation

建议 commits：

1. `feat(ui): add design tokens and visual foundations`
2. `feat(ui): add glass and motion fallback foundations`
3. `docs(ui): record M1 browser acceptance evidence`

只包含 token、基础样式和验收证据，不迁移业务组件。

### PR 2 — M2 Editor Shell

建议 commits：

1. `feat(ui): build canvas-first editor shell`
2. `feat(ui): add status bar and responsive shell modes`
3. `docs(ui): record M2 shell acceptance evidence`

若 Canvas 几何调整较大，可把 Responsive 单独放第三个代码 commit，但不得与 M3 控件混合。

### PR 3 — M3 Base Controls

建议 commits：

1. `feat(ui): add accessible base controls and dialog`
2. `feat(ui): migrate toolbar and dialogs to base controls`
3. `docs(ui): record M3 control state acceptance`

如需增加 Lucide 依赖，应放在第一个 commit，并在 PR 描述中记录包体与许可证影响。

### PR 4 — M4 LevelPanel / Inspector / Junction

建议 commits：

1. `feat(ui): migrate level panel and inspector structure`
2. `feat(ui): migrate junction inspector presentation`
3. `docs(ui): record M4 junction stress-test evidence`

Junction 独立 commit，便于单独审查和回滚。

### PR 5 — M5 ToolDock / Validation / Route Preview

建议 commits：

1. `feat(ui): move editor tools into floating tool dock`
2. `feat(ui): migrate validation drawer and route preview`
3. `docs(ui): record M5 editor-state acceptance`

若 PR 过大，可拆成 M5A ToolDock、M5B Validation/Preview 两个 PR，但两者仍属于同一 Milestone，M5B 完成前不得开始 M6。

### PR 6 — M6 Liquid Motion

建议 commits：

1. `feat(ui): add liquid focus and panel motion`
2. `feat(ui): add reduced-motion behavior`
3. `docs(ui): record M6 motion acceptance`

Motion 与 Reduced Motion 必须在同一 PR 内完成，不能先合并只支持正常动画的版本。

### PR 7 — M7 Optical Refraction / Performance

建议 commits：

1. `feat(ui): add progressive liquid refraction`
2. `perf(ui): enforce fallback and rendering budget`
3. `docs(ui): record M7 fallback and performance evidence`

Refraction 与 fallback 必须一起合并；不允许先合并只有 Full 效果的版本。

---

## 8. PR 模板要求

每个 UI Migration PR 描述至少包含：

- 对应 Milestone；
- 目标状态；
- 明确未修改的范围；
- 改动文件清单；
- 新增文件清单；
- emits / Store actions 保持声明；
- 自动检查结果；
- 浏览器、viewport 与 Console 状态；
- 截图索引；
- 已知临时差异；
- 回滚方式；
- 下一 Milestone 的依赖，不得预先实现下一阶段内容。

---

## 9. 最终完成标准

只有 M1–M7 全部完成后，才可宣布 TDPE UI Migration v1 完成。最终状态必须同时满足：

- Canvas 仍是第一视觉主体；
- 页面符合 Dark Liquid Glass Editor 的克制方向；
- G0/G1/G2/G3 分层清晰；
- ToolDock、Validation Drawer、Route Preview、Dialog 的层级稳定；
- Junction Inspector 在复杂状态下可读、可操作；
- Hover、Press、Focus、Active、Disabled、Error 完整；
- Normal Motion、Reduced Motion、Refraction Full、Refraction Fallback 均可用；
- Canvas RenderTheme 与 UI Theme 保持独立；
- Store、Domain、Editor Runtime、IO、Persistence 未被 UI Migration 重构；
- 所有既有事件、快捷键、历史、自动保存、Validation 和 Route Preview 行为保持；
- 所有自动检查、浏览器回归、截图和性能证据完整。

---

## 10. 本计划的执行边界

本文件只定义迁移顺序、范围、验收和提交策略。

当前状态：

```text
M1 Foundation — NOT STARTED
```

生成本计划不代表授权开始 M1，也不包含任何 Vue、CSS、TypeScript 或业务实现改动。
