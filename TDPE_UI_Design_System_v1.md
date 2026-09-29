# TDPE UI Design System v1
## Dark Liquid Glass Editor

> **项目**：Tower Defense Path Editor  
> **仓库**：`gwxcsny53/TowerDefencePath-Generation`  
> **文档用途**：后续所有 UI / UX / 视觉 / 动画 / 组件实现的统一参考标准  
> **版本**：v1.0  
> **状态**：Design Baseline / Source of Truth

---

# 1. 设计目标

TDPE 的 UI 不采用传统后台管理系统风格，也不采用简单的“毛玻璃 + 大圆角 + 蓝色按钮”方案。

正式视觉方向定义为：

> **Dark Liquid Glass Editor**  
> 深色、安静、精密的游戏关卡编辑工作台。  
> Canvas 负责内容，Glass 负责控制，Liquid 负责交互焦点。

核心目标：

1. **Canvas First**：地图编辑区域始终是第一视觉主体。
2. **Professional Tool**：界面必须像生产工具，而不是展示型网页。
3. **Liquid Glass**：液态玻璃只用于交互焦点和悬浮控制层，不滥用。
4. **High Information Density**：适合长时间桌面编辑。
5. **Motion with Meaning**：动画只负责表达状态、层级、切换和反馈。
6. **Progressive Enhancement**：完整折射效果作为增强能力，基础 Glass 效果必须独立可用。

---

# 2. 视觉关键词

| 维度 | 定义 |
|---|---|
| 整体风格 | Dark Liquid Glass |
| 气质 | 专业、现代、精密、流体、克制 |
| 主视觉 | Canvas |
| 主要材质 | 深色半透明玻璃 |
| 交互材质 | Liquid Lens |
| 主色 | Blue / Cyan |
| 状态色 | Green / Amber / Red |
| 信息密度 | 中高 |
| 圆角 | 中等 |
| 阴影 | 柔和、低对比 |
| 动画 | Fluid + Spring |
| 图标 | 统一线性 Icon |
| 语言 | 编辑器 / Developer Tool |

禁止向以下方向发展：

- SaaS Dashboard
- 强霓虹赛博朋克
- 全界面高强度玻璃
- 大面积发光
- 大卡片、大留白
- 过度拟物
- 大幅弹跳动画
- 每个组件各自定义视觉规则

---

# 3. 核心视觉原则

## 3.1 Canvas 是内容层

Canvas 必须：

- 稳定
- 清晰
- 高对比
- 不使用 Liquid Glass
- 不使用大面积 Blur
- 不使用高亮边缘装饰
- 不被周边 UI 抢走视觉权重

## 3.2 Glass 是控制层

用于：

- Top Bar
- Level Panel
- Inspector
- Tool Dock
- Dialog
- Route Preview
- Validation Drawer
- Tooltip
- Popover

## 3.3 Liquid 是交互焦点

真正的折射、液态拉伸、Spring Lens，只允许用于：

- 当前工具
- Active Tab
- Segmented Control
- Toggle Thumb
- Slider Thumb
- Primary Action
- Floating Toolbar
- Route Preview 控制
- 少量关键 Hover / Active 状态

---

# 4. 玻璃材质分级

| Level | 名称 | 用途 | Blur | Refraction | 动画 |
|---|---|---|---:|---:|---:|
| G0 | Workspace | Canvas、主工作区 | 0 | 无 | 无 |
| G1 | Glass Surface | Level、Inspector、Dialog、Drawer | 16–20px | 极弱 | 极轻 |
| G2 | Floating Glass | TopBar、ToolDock、Preview、Tooltip | 22–28px | 中等 | 中 |
| G3 | Liquid Lens | Active Tool、Toggle、Slider、Tab | 8–14px | 强 | 强 |

视觉层级：

```text
G0 Workspace
    ↓
G1 Information Surface
    ↓
G2 Floating Control
    ↓
G3 Liquid Interaction Focus
```

---

# 5. Design Tokens

## 5.1 Background

| Token | Value | 用途 |
|---|---|---|
| `--bg-app` | `#080B10` | 应用最底层 |
| `--bg-workspace` | `#0B0F15` | 工作区 |
| `--bg-canvas` | `#0E131B` | Canvas 基础色 |
| `--surface-dark` | `#121821` | 辅助深色 Surface |
| `--surface-hover` | `#18212D` | 普通 Hover |
| `--surface-active` | `rgba(77,163,255,.14)` | Active Soft Surface |

## 5.2 Text

| Token | Value |
|---|---|
| `--text-primary` | `#F4F7FB` |
| `--text-secondary` | `#B7C0CC` |
| `--text-muted` | `#7E8998` |
| `--text-disabled` | `#505A67` |
| `--text-inverse` | `#071018` |

原则：

- 普通正文禁止大面积纯白。
- 纯白仅用于关键标题、Icon、高光。
- Metadata 必须弱于普通正文。

## 5.3 Border

| Token | Value |
|---|---|
| `--border-subtle` | `rgba(255,255,255,.06)` |
| `--border-default` | `rgba(255,255,255,.08)` |
| `--border-strong` | `rgba(255,255,255,.12)` |
| `--border-focus` | `#4DA3FF` |

## 5.4 Accent

| Token | Value |
|---|---|
| `--accent-primary` | `#4DA3FF` |
| `--accent-primary-bright` | `#76C4FF` |
| `--accent-cyan` | `#49D9E8` |
| `--accent-soft` | `rgba(77,163,255,.14)` |
| `--accent-glow` | `rgba(77,163,255,.22)` |

推荐颜色占比：

```text
90% Neutral
8% Blue / Cyan
2% Status Color
```

## 5.5 Status

| Token | Value |
|---|---|
| `--status-success` | `#22C55E` |
| `--status-warning` | `#F59E0B` |
| `--status-danger` | `#EF4444` |
| `--status-info` | `#22D3EE` |

---

# 6. Glass Tokens

## 6.1 G1 — Glass Surface

```css
background: rgba(18, 24, 33, 0.68);
backdrop-filter: blur(18px) saturate(115%);
border: 1px solid rgba(255,255,255,.08);
box-shadow: 0 12px 40px rgba(0,0,0,.18);
```

建议：

- Radius：12px
- Specular：极弱
- Refraction：可选 / 极弱

用于：

- LevelPanel
- Inspector
- Dialog
- ValidationDrawer

---

## 6.2 G2 — Floating Glass

```css
background: rgba(28, 34, 44, 0.52);
backdrop-filter: blur(24px) saturate(120%);
border: 1px solid rgba(255,255,255,.12);
box-shadow: 0 12px 36px rgba(0,0,0,.30);
```

建议：

- Radius：16–20px
- Refraction：Medium
- Specular：明显但窄
- 不允许强 Glow

用于：

- TopBar
- ToolDock
- RoutePreview
- Tooltip
- ContextMenu
- Popover
- Toast

---

## 6.3 G3 — Liquid Lens

```css
background: rgba(77,163,255,.16);
border: 1px solid rgba(180,220,255,.24);
box-shadow: 0 0 16px rgba(77,163,255,.08);
```

建议：

- Radius：14px / Pill
- Blur：8–14px
- Refraction：High
- Specular：High
- 支持 Spring Motion
- 支持宽度短暂拉伸

用于：

- Tool Active Lens
- Toggle Thumb
- Segmented Indicator
- Slider Thumb
- Primary Liquid Action

---

# 7. Spacing System

统一采用 4px 基础网格。

| Token | Value |
|---|---:|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-6` | 24px |
| `--space-8` | 32px |

禁止随意新增：

- 10px
- 14px
- 18px
- 22px

除非组件几何计算必须。

---

# 8. Radius System

| Token | Value | 用途 |
|---|---:|---|
| `--radius-control` | 8px | Input / Button |
| `--radius-menu` | 10px | Popover / Menu |
| `--radius-panel` | 12px | Level / Inspector |
| `--radius-dialog` | 14px | Dialog |
| `--radius-floating` | 16px | TopBar |
| `--radius-liquid` | 20px | ToolDock |
| `--radius-pill` | 999px | Pill / Toggle |

---

# 9. Typography

优先使用系统字体：

```css
font-family:
  Inter,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

若不额外安装 Inter，则直接使用 system-ui。

| 类型 | Size | Weight | 用途 |
|---|---:|---:|---|
| Window Title | 15–16px | 600 | TDPE |
| Panel Title | 13–14px | 600 | Inspector |
| Body | 13px | 400 | 正文 |
| Control | 13px | 500 | Button/Input |
| Metadata | 11–12px | 400 | 辅助信息 |
| Section Label | 11px | 600 | BASIC / CONNECTIONS |

Section Label：

```css
text-transform: uppercase;
letter-spacing: .06em;
```

---

# 10. Motion Tokens

| Token | Duration | 用途 |
|---|---:|---|
| `--motion-fast` | 100ms | Hover / Press |
| `--motion-normal` | 180ms | Input / Tooltip |
| `--motion-panel` | 220ms | Panel / Drawer |
| `--motion-liquid` | 260ms | Liquid Lens |
| `--motion-modal` | 180ms | Dialog |

标准 easing：

```css
cubic-bezier(.2,.8,.2,1)
```

Liquid：

- 优先 Spring-like
- 允许轻微 overshoot
- 禁止明显 bounce

---

# 11. Z-Index System

| Layer | Z |
|---|---:|
| Workspace | 0 |
| Canvas | 10 |
| Side Panels | 20 |
| Floating UI | 30 |
| Drawer | 40 |
| Backdrop | 50 |
| Dialog | 60 |
| Tooltip | 70 |
| Toast | 80 |

禁止组件自行使用任意 `z-index: 9999`。

---

# 12. 页面视觉布局

## 12.1 1440 × 900 基准

| 区域 | X | Y | W | H |
|---|---:|---:|---:|---:|
| App margin | 12 | 12 | — | — |
| TopBar | 12 | 12 | 1416 | 48 |
| Workspace | 12 | 72 | 1416 | 772 |
| LevelPanel | 12 | 72 | 228 | 772 |
| Canvas | 252 | 72 | 828 | 772 |
| Inspector | 1092 | 72 | 336 | 772 |
| StatusBar | 12 | 856 | 1416 | 32 |
| ToolDock | Canvas 内底部居中 | — | ~300 | 44 |

区域 Gap：

```text
12px
```

## 12.2 扩展策略

1920px：

```text
LevelPanel   228px
Canvas       1fr
Inspector    336px
```

大屏新增宽度全部优先给 Canvas。

---

# 13. TopBar Spec

结构：

```text
╭──────────────────────────────────────────────────────╮
│ TDPE   Chapter 01 / Stage 03     ↶ ↷    ✓ Saved   ▶ │
╰──────────────────────────────────────────────────────╯
```

| 属性 | 定义 |
|---|---|
| Height | 48px |
| Radius | 16px |
| Material | G2 |
| Padding X | 12px |
| Gap | 8px |

内容：

### Left

- TDPE
- Current Chapter / Stage

### Center

- Undo
- Redo

### Right

- Save Status
- Validate
- Preview
- More

导入、导出、项目收进 `•••`。

---

# 14. ToolDock Spec

结构：

```text
╭────────────────────────────────────╮
│ ↖    ━    S    E    ◇    ⌫      │
╰────────────────────────────────────╯
```

| 属性 | 定义 |
|---|---|
| Height | 44px |
| Radius | 20px |
| Padding | 4px |
| Gap | 2px |
| Material | G2 |
| Tool Item | 36×36 |

工具建议：

| Icon | Tool |
|---|---|
| Pointer | Select |
| Route | Path |
| S | Spawn |
| E | End |
| Diamond | Tower |
| Eraser | Eraser |

文本通过 Tooltip 提供。

---

# 15. Tool Liquid Lens

Active Tool 使用 G3。

切换动画：

```text
Start
↓
Lens Stretch
↓
Spring Move
↓
Small Overshoot
↓
Settle
```

建议：

| 阶段 | Duration |
|---|---:|
| Stretch | 60ms |
| Move | 130ms |
| Overshoot | 50ms |
| Settle | 40ms |

Lens Width：

```text
36px → 42px → 36px
```

---

# 16. LevelPanel Spec

结构：

```text
LEVELS                         ＋

CHAPTER 01
  01
  02
● 03                       ···

CHAPTER 02
  01
```

| 属性 | 定义 |
|---|---|
| Width | 228px |
| Material | G1 |
| Radius | 12px |
| Padding | 12px |

原则：

- 新建只保留一个 `+`
- Duplicate / Resize / Delete 收进 `•••`
- 不永久显示大量操作按钮

---

# 17. LevelItem Spec

| 属性 | 定义 |
|---|---|
| Height | 30px |
| Radius | 8px |
| Padding X | 8px |

状态：

### Default

- Transparent
- Text Secondary

### Hover

- `rgba(255,255,255,.05)`
- 显示 `•••`

### Active

- 低强度 Liquid Highlight
- 左侧小圆点 / Accent
- 不使用实心蓝底

切换关卡：

- Highlight 纵向滑动
- 180–220ms

---

# 18. Inspector Spec

| 属性 | 定义 |
|---|---|
| Width | 336px |
| Material | G1 |
| Radius | 12px |
| Padding | 14–16px |

结构：

```text
INSPECTOR

Junction
X 12 · Y 8

BASIC
────────────────────

Type               Junction
Position           12, 8
ID                 junction_04

CONNECTIONS
────────────────────

...

DANGER ZONE
────────────────────

Delete Junction
```

原则：

- 使用 Section，不大量使用 Card
- 不做大面积 Glow
- 属性行高密度排列
- Label 弱，Value 强

---

# 19. Inspector Section

Section Header：

```text
CONNECTIONS
────────────────
```

| 属性 | 定义 |
|---|---|
| Font | 11px |
| Weight | 600 |
| Color | Muted |
| Letter spacing | .06em |
| Section spacing | 20–24px |

---

# 20. PropertyRow Spec

标准：

```text
Type                  Junction
Position              12, 8
ID                    junction_01
```

推荐比例：

```text
Label 40–45%
Value 55–60%
```

Row Height：

```text
28–30px
```

不为每一行加 Border。

---

# 21. Button System

只允许四种：

| 类型 | 用途 |
|---|---|
| Primary | 关键动作 |
| Secondary | 普通动作 |
| Ghost | Toolbar / Icon |
| Danger | 删除 / 覆盖 |

## 21.1 Primary

- G2 / G3
- Blue Liquid
- Hover：Specular / Refraction 增强
- Press：`scale(.97)`
- Focus：Cyan Ring
- Disabled：Opacity .4

## 21.2 Secondary

```css
background: rgba(255,255,255,.04);
```

Hover：

```css
background: rgba(255,255,255,.08);
```

不使用强 Refraction。

## 21.3 Ghost

- Default：Transparent
- Hover：轻 Surface
- 最安静的 Button 类型

## 21.4 Danger

Default：

- Dark Surface
- Red Text

Hover：

```css
background: rgba(239,68,68,.10);
```

只有最终确认动作才允许更明显红色。

---

# 22. IconButton

| Size | Dimension |
|---|---:|
| Compact | 28×28 |
| Normal | 32×32 |
| ToolDock | 36×36 |

状态：

| State | Visual |
|---|---|
| Default | Transparent |
| Hover | Soft Surface |
| Press | scale(.94) |
| Active | Liquid Lens |
| Disabled | opacity .4 |

---

# 23. TextInput

| 属性 | 定义 |
|---|---|
| Height | 32px |
| Radius | 8px |
| Padding X | 8px |
| Background | `rgba(255,255,255,.04)` |
| Border | `rgba(255,255,255,.08)` |

Focus：

```css
border-color: #4DA3FF;
box-shadow: 0 0 0 3px rgba(77,163,255,.10);
```

Error：

```css
border-color: #EF4444;
```

---

# 24. Toggle

用于 Bool 属性。

Track：

| State | Background |
|---|---|
| Off | `rgba(255,255,255,.08)` |
| On | `rgba(77,163,255,.28)` |

Thumb：

- G3 Liquid Lens
- 20–22px
- Spring 180–220ms
- 支持 Stretch → Move → Settle

---

# 25. Checkbox

不做 Liquid。

| 属性 | 定义 |
|---|---|
| Size | 18×18 |
| Radius | 5px |
| Checked | Blue/Cyan |
| Animation | 120ms check scale |

---

# 26. Slider

Track：

```text
2px
```

Active：

- Blue / Cyan

Thumb：

- G3
- Hover `scale(1.12)`
- Drag 轻 Glow
- Release Spring

---

# 27. Segmented Control

结构：

```text
╭────────────────────╮
│ Edit    Preview    │
│ ╰────╯             │
╰────────────────────╯
```

Active Indicator：

- G3 Lens
- 与 ToolDock 共用 Motion 语言

---

# 28. Dialog Spec

统一 BaseDialog。

| 属性 | 定义 |
|---|---|
| Material | G1 |
| Radius | 14px |
| Padding | 16px |
| Blur | 20px |
| Shadow | Strong |

动画：

### Enter

```text
opacity 0 → 1
scale .97 → 1
translateY 6px → 0
180ms
```

### Exit

```text
140ms
```

退出比进入快。

---

# 29. Dialog Width

| Dialog | Width |
|---|---:|
| New Level | 400px |
| Resize | 440px |
| Import | 480px |
| Export | 440px |
| Dangerous Confirm | 380px |

默认不超过：

```text
640px
```

---

# 30. Modal Backdrop

```css
background: rgba(4,8,13,.55);
backdrop-filter: blur(4px);
```

原则：

- 不做纯黑
- Blur 不超过 4–6px
- 保留用户对原界面的空间感

---

# 31. RoutePreviewPanel

位置：

```text
Canvas Top Right
16px
```

宽度：

```text
240–260px
```

Material：

```text
G2
```

结构：

```text
ROUTE PREVIEW

Spawn        spawn_01
Target       end_01
Time         2.4 / 6.8s
Progress     12 / 34

━━━━━━━━━━━━━━

Stop             Close
```

进入：

```text
opacity 0 → 1
translateY -4px → 0
scale .98 → 1
180ms
```

---

# 32. ProgressBar

| 属性 | 定义 |
|---|---|
| Height | 3px |
| Background | `rgba(255,255,255,.08)` |
| Active | `#49D9E8` |
| Radius | Pill |

允许弱 moving highlight。

禁止霓虹。

---

# 33. Validation

默认不占固定 160px。

StatusBar 展示：

```text
✓ Validation
```

有问题：

```text
● 3 Errors    △ 2 Warnings
```

点击打开 Bottom Drawer。

---

# 34. ValidationDrawer

| 属性 | 定义 |
|---|---|
| Material | G1 |
| Height | 240–320px |
| Max Height | 40% Canvas |
| Motion | 220ms |

动画：

```text
translateY 12px → 0
opacity 0 → 1
```

---

# 35. ValidationItem

Error：

```text
● Missing End
  X 12 · Y 9
```

Warning：

```text
△ Junction Weight
```

Hover：

- Surface 亮度提高

Focused：

- 左侧 2px Accent
- Soft Status Surface

点击：

- Canvas 对应格子 Focus
- 仅短促 Pulse
- 禁止强 Shake

---

# 36. StatusBar

结构：

```text
Path Tool   X12 Y8      Grid 20×20      ✓ Saved      ✓ Valid
```

| 属性 | 定义 |
|---|---|
| Height | 32px |
| Font | 11–12px |
| Material | G1 / Light G2 |

内容：

### Left

- Current Tool
- Cursor Grid Position

### Center

- Grid Size

### Right

- Save State
- Validation

---

# 37. Save Status

| 状态 | 显示 |
|---|---|
| Loading | Loading… |
| Saving | Saving… |
| Saved | ✓ Saved |
| Error | ● Save Failed |

Saved：

```text
成功瞬间 Cyan
↓
500ms
回到 Muted
```

不要长期绿色。

---

# 38. Tooltip

| 属性 | 定义 |
|---|---|
| Material | G2 |
| Radius | 8px |
| Font | 12px |
| Delay | 400ms |
| Enter | 100–120ms |

结构：

```text
Draw Path
Shortcut 2
```

动画：

```text
opacity 0 → 1
translateY 3px → 0
```

---

# 39. ContextMenu / MoreMenu

| 属性 | 定义 |
|---|---|
| Width | 160px |
| Material | G2 |
| Radius | 10px |
| Padding | 6px |
| Row Height | 30px |

进入：

```text
opacity 0 → 1
scale .97 → 1
140ms
```

---

# 40. Toast

尽量少用。

适合：

- Import succeeded
- Export generated
- Unexpected error

不适合：

- 每次自动保存
- 每次选择工具
- 每次校验

| 属性 | 定义 |
|---|---|
| Width | 240–320px |
| Material | G2 |
| Radius | 10px |
| Duration | 2.5–4s |

位置：

```text
Top Right
TopBar 下 12px
```

---

# 41. Empty State

推荐结构：

```text
No Selection

Select an element on the canvas
to inspect its properties.
```

组成：

- 弱 Icon
- Title
- Description

禁止：

- 大插画
- 彩色空状态
- 大按钮

---

# 42. Scrollbar

```css
width: 6px;
```

Track：

```css
background: transparent;
```

Thumb：

```css
background: rgba(255,255,255,.12);
border-radius: 999px;
```

Hover：

```css
background: rgba(255,255,255,.22);
```

---

# 43. Canvas Render Theme

Canvas 不跟 UI 共用全部颜色体系。

地图语义色独立。

| Element | Color Direction |
|---|---|
| Grid | Deep Neutral |
| Path | Blue |
| Spawn | Green |
| End | Red |
| Tower | Warm Amber |
| Junction | Violet |
| Selection | Cyan |
| Validation Error | Red |
| Validation Warning | Amber |
| Preview | Cyan |

原则：

- Canvas 数据颜色比 UI 更实、更明确。
- UI Accent 不覆盖地图语义。
- Preview Cyan 与 Selection Cyan 需靠线型/动画区分。

---

# 44. Liquid Glass 使用白名单

允许：

- Tool Active Lens
- Toggle Thumb
- Segmented Indicator
- Slider Thumb
- Primary Button
- Floating ToolDock
- Route Preview Control

禁止：

- Inspector 大面积背景
- Validation List
- 普通 TextInput 内部
- Canvas
- 每个 Button
- 每个 List Item
- 普通 Error Message

---

# 45. 页面状态

至少支持以下状态：

| 状态 | 页面变化 |
|---|---|
| Normal Editing | 标准三栏 |
| Object Selected | Inspector 展示属性 |
| Route Preview | Preview Panel + Canvas Route |
| Validation Open | Bottom Drawer |
| Modal Open | Backdrop + Dialog |

规则：

- Modal Open 时所有编辑操作禁止。
- ToolDock / Level / Canvas / Inspector 不响应 Pointer。
- Route Preview 可保留视觉，但暂停交互。
- Validation Drawer 与 Dialog 不同时作为主交互层。

---

# 46. Panel Collapse

桌面默认：

```text
LevelPanel   Open
Inspector    Open
```

允许折叠。

动画：

```text
220ms
```

折叠后 Canvas 自动扩大。

不要通过隐藏 Canvas 内容换空间。

---

# 47. Responsive Policy

这是桌面编辑器，不以手机为目标。

| Width | 策略 |
|---|---|
| ≥ 1280 | Full |
| 1100–1279 | Compact |
| 900–1099 | Overlay Panel |
| < 900 | 非主要目标 |

Compact：

```text
LevelPanel    200px
Inspector     300px
```

ToolDock 尺寸保持不变。

禁止通过不断缩小控件适配窄屏。

---

# 48. Accessibility / Interaction

必须：

- 所有 IconButton 有 Tooltip / aria-label。
- Focus Visible 必须存在。
- Disabled 必须具有视觉差异。
- 状态不能只依赖颜色。
- Error / Warning 同时用 Icon 或 Label 表达。
- Motion 应尊重 `prefers-reduced-motion`。
- 对比度不足时优先牺牲 Glass 透明度，不牺牲文字可读性。

Reduced Motion：

- 禁用 Lens stretch
- 禁用 Overshoot
- Panel 仅 Fade
- 保留必要状态变化

---

# 49. Browser / Liquid Fallback

完整 Liquid Refraction 属于增强能力。

必须设计两级实现：

## Full

适用于支持完整 SVG / Backdrop Refraction 的浏览器：

```text
Refraction
+ Blur
+ Specular
+ Spring Lens
```

## Fallback

```text
Backdrop Blur
+ Transparent Surface
+ Border Highlight
+ Shadow
+ Same Motion
```

规则：

> 不支持真实折射时，UI 仍必须完整可用且视觉成立。

---

# 50. 性能规则

禁止：

- 大面积实时重算 displacement map
- 鼠标移动时让整个 Inspector 形变
- 每个列表项使用独立昂贵 Filter
- 大尺寸多层强 Blur
- 无限循环高成本动画

推荐：

- Refraction 仅用于小型 G3 组件
- G1 大面板只使用 Blur
- G2 根据面积谨慎使用 Refraction
- 动画优先 transform / opacity / filter parameter
- 避免频繁改变实际玻璃几何尺寸

---

# 51. Icon System

推荐：

```text
Lucide
```

规范：

| 类型 | Size |
|---|---:|
| Auxiliary | 14px |
| Normal | 16px |
| Important | 18px |

Stroke：

```text
1.5–1.75
```

禁止：

- Emoji 作为正式 UI Icon
- 混用多个 Icon Pack
- Icon 风格不统一
- 部分 Filled、部分 Outline

---

# 52. 组件架构建议

```text
Glass
├─ GlassSurface
├─ GlassPanel
├─ FloatingBar
├─ Popover
└─ Dialog

Controls
├─ Button
├─ IconButton
├─ TextInput
├─ NumberInput
├─ Toggle
├─ Checkbox
├─ Slider
└─ SegmentedControl

Liquid
├─ LiquidLens
├─ ToolIndicator
└─ SegmentIndicator

Editor
├─ TopBar
├─ LevelPanel
├─ ToolDock
├─ Inspector
├─ StatusBar
├─ ValidationDrawer
└─ RoutePreviewPanel
```

设计层和代码层不要求 1:1，但视觉职责必须保持。

---

# 53. 实现优先级

推荐实现顺序：

## Phase 1 — Foundation

- Design Tokens
- Background
- Typography
- Spacing
- Radius
- Motion
- Z-index

## Phase 2 — Base Controls

- Button
- IconButton
- Input
- Checkbox
- Toggle
- Tooltip
- Popover
- Dialog

## Phase 3 — Main Layout

- EditorView
- TopBar
- LevelPanel
- Inspector
- StatusBar
- Canvas framing

## Phase 4 — Floating Interaction

- ToolDock
- Liquid Lens
- Preview Panel
- Menus

## Phase 5 — Secondary States

- Validation Drawer
- Toast
- Empty State
- Loading / Save Status

## Phase 6 — Refraction Enhancement

- SVG displacement
- G2/G3 refraction
- Progressive enhancement
- Performance tuning

---

# 54. 禁止事项

后续实现中禁止出现以下做法：

1. 每个 Vue 文件随意定义新的颜色值。
2. 每个组件自己定义新的 Radius。
3. 大量 `#fff / #ccc / blue` 硬编码。
4. Panel、Dialog、Popover 使用不同设计语言。
5. ToolDock 变成传统蓝色按钮组。
6. 所有元素都使用 Liquid Refraction。
7. Canvas 使用 Glass。
8. Inspector 大量使用 Card。
9. Validation 固定占据 160px。
10. TopBar 永久暴露所有功能。
11. 强霓虹 Glow。
12. 大幅 Scale / Bounce。
13. Toast 用于普通状态反馈。
14. 删除操作默认大红色实心按钮。
15. 无 Hover / Focus / Disabled 状态。
16. 动画使用 Linear。
17. 未考虑 Reduced Motion。
18. 不支持 Liquid 时 UI 失效。

---

# 55. 设计验收标准

每次 UI PR 至少检查：

## Layout

- [ ] Canvas 是否仍是第一视觉主体？
- [ ] Side Panel 是否没有抢视觉焦点？
- [ ] 新增元素是否遵守 4px Grid？
- [ ] 是否使用既有 Radius？
- [ ] 是否保持 12px 主 Gap？

## Color

- [ ] 是否使用 Token？
- [ ] 是否新增了无必要硬编码颜色？
- [ ] Accent 是否使用过度？
- [ ] Status Color 是否只表达状态？

## Glass

- [ ] 是否选对 G1/G2/G3？
- [ ] 是否存在不必要 Liquid？
- [ ] Glass 是否影响文字可读性？
- [ ] Fallback 是否成立？

## Motion

- [ ] 动画是否表达状态？
- [ ] 是否遵守 Motion Token？
- [ ] 是否存在无意义循环动画？
- [ ] Reduced Motion 是否可接受？

## Interaction

- [ ] Hover 完整？
- [ ] Pressed 完整？
- [ ] Focus Visible 完整？
- [ ] Disabled 完整？
- [ ] Error / Warning 不只依赖颜色？

## Editor

- [ ] Canvas 数据仍然清晰？
- [ ] Tool 状态是否明显？
- [ ] Inspector 是否保持高信息密度？
- [ ] Validation 是否不长期占据大面积空间？

---

# 56. 设计决策优先级

发生设计冲突时，按以下顺序裁决：

```text
1. 可用性
2. Canvas 清晰度
3. 信息层级
4. 一致性
5. 性能
6. Liquid Glass 视觉表现
7. 装饰性
```

Liquid Glass 永远不能凌驾于可用性和 Canvas 可读性之上。

---

# 57. 最终视觉描述

最终 TDPE 应当呈现为：

> 一个深色、安静、精密的游戏关卡编辑工作台。  
> 中央地图清晰、稳定、实体化；左右信息面板像两片低调的暗色玻璃悬浮在工作区上。  
> 底部中央的 Tool Dock 是主要视觉记忆点，当前工具由一枚透明 Liquid Lens 平滑移动表示。  
> 路线测试、校验、状态提示通过临时 Glass Layer 出现，并在任务完成后退回安静状态。  
> 平时界面保持克制，只有用户真正发生操作时，界面才“活起来”。

---

# 58. 一句话设计原则

> **Canvas is content. Glass is control. Liquid is focus.**

后续任何新增 UI，在设计或实现前都应先判断：

1. 它属于内容层还是控制层？
2. 它应该是 G0 / G1 / G2 / G3 哪一层？
3. 它是否真的需要 Liquid？
4. 它是否会削弱 Canvas？
5. 它是否复用了既有 Token 与组件语言？

如果答案无法明确，则不应直接进入实现。

---

# 59. 文档维护规则

本文件作为 TDPE UI 的视觉 Source of Truth。

后续如果发生视觉规范变更：

1. 先修改本文件。
2. 再修改实现。
3. 不允许实现先出现新规则、文档长期不更新。
4. 新组件若需要新增 Token，应先补充 Token 章节。
5. 新动画若超出现有 Motion 体系，应先评估是否真的必要。

---

**TDPE UI Design System v1 End**
