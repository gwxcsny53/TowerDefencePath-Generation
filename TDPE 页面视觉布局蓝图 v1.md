┌──────────────────────────────────────────────────────────────────────────────┐
│ 12px │
│ ╭──────────────────── Floating Top Bar ───────────────────────────────╮ │
│ │ TDPE Project / Chapter 01 / Stage 03 ✓ Saved ↶ ↷ ◇ ▶ │ │
│ ╰──────────────────────────────────────────────────────────────────────╯ │
│ │
│ ╭──────────────╮ ┌──────────────────────────────────┐ ╭──────────────╮ │
│ │ │ │ │ │ │ │
│ │ LEVELS │ │ │ │ INSPECTOR │ │
│ │ │ │ │ │ │ │
│ │ Chapter 01 │ │ │ │ BASIC │ │
│ │ 01 │ │ CANVAS │ │ Type │ │
│ │ 02 │ │ │ │ Position │ │
│ │ ●03 │ │ │ │ │ │
│ │ │ │ │ │ CONNECTIONS │ │
│ │ Chapter 02 │ │ │ │ │ │
│ │ 01 │ │ │ │ │ │
│ │ │ │ │ │ │ │
│ │ │ │ ╭──────────────────────╮ │ │ │ │
│ │ │ │ │ ↖ ━ S E ◇ ⌫ │ │ │ │ │
│ │ │ │ ╰──── Tool Dock ───────╯ │ │ │ │
│ ╰──────────────╯ └──────────────────────────────────┘ ╰──────────────╯ │
│ │
│ ╭──────────────────────────── Status Bar ─────────────────────────────╮ │
│ │ Path Tool Grid 20×20 ✓ Saved ✓ Validation │ │
│ ╰─────────────────────────────────────────────────────────────────────╯ │
│ │
└──────────────────────────────────────────────────────────────────────────────┘

我会以 1440×900 作为主设计基准，因为这个尺寸足够接近常见桌面开发环境；1920×1080 只需要扩展 Canvas，不改变核心结构。
TDPE 页面视觉布局蓝图 v1
整体结构确定为：
┌──────────────────────────────────────────────────────────────────────────────┐
│ 12px │
│ ╭──────────────────── Floating Top Bar ───────────────────────────────╮ │
│ │ TDPE Project / Chapter 01 / Stage 03 ✓ Saved ↶ ↷ ◇ ▶ │ │
│ ╰──────────────────────────────────────────────────────────────────────╯ │
│ │
│ ╭──────────────╮ ┌──────────────────────────────────┐ ╭──────────────╮ │
│ │ │ │ │ │ │ │
│ │ LEVELS │ │ │ │ INSPECTOR │ │
│ │ │ │ │ │ │ │
│ │ Chapter 01 │ │ │ │ BASIC │ │
│ │ 01 │ │ CANVAS │ │ Type │ │
│ │ 02 │ │ │ │ Position │ │
│ │ ●03 │ │ │ │ │ │
│ │ │ │ │ │ CONNECTIONS │ │
│ │ Chapter 02 │ │ │ │ │ │
│ │ 01 │ │ │ │ │ │
│ │ │ │ │ │ │ │
│ │ │ │ ╭──────────────────────╮ │ │ │ │
│ │ │ │ │ ↖ ━ S E ◇ ⌫ │ │ │ │ │
│ │ │ │ ╰──── Tool Dock ───────╯ │ │ │ │
│ ╰──────────────╯ └──────────────────────────────────┘ ╰──────────────╯ │
│ │
│ ╭──────────────────────────── Status Bar ─────────────────────────────╮ │
│ │ Path Tool Grid 20×20 ✓ Saved ✓ Validation │ │
│ ╰─────────────────────────────────────────────────────────────────────╯ │
│ │
└──────────────────────────────────────────────────────────────────────────────┘

这里最重要的决定是：Canvas 本身不做玻璃。左、右、上、下都是悬浮在 Canvas 工作空间周围的控制层。

1. 1440×900 基准布局
   精确尺寸建议如下。
   区域 X Y W H 材质
   App 外边距 12 12 — — —
   Top Bar 12 12 1416 48 G2
   Workspace 12 72 1416 772 —
   Level Panel 12 72 228 772 G1
   Canvas 252 72 828 772 G0
   Inspector 1092 72 336 772 G1
   Status Bar 12 856 1416 32 G1/G2
   Tool Dock Canvas 内居中 Canvas 底部 18px 约 300 44 G2 + G3

三栏之间全部固定：
12px Gap

因此整个应用有统一呼吸感，而不是三个区域互相贴死。
1920 宽度时：
Level 228px
Inspector 336px
Canvas 自动扩展

也就是说，大屏增加的空间全部交给 Canvas。2. Top Bar 蓝图
Top Bar 不应该再是传统网页 Header。
内部拆成三个区域：
╭────────────────────────────────────────────────────────────────╮
│ TDPE Chapter 01 / Stage 03 ↶ ↷ ✓ Saved ◇ ▶ │
│ ──────────────── Left ───────── Center ───── Right ────── │
╰────────────────────────────────────────────────────────────────╯

区域 内容 优先级
Left 产品名 + 当前关卡 中
Center Undo / Redo 中
Right 保存状态 / Validate / Preview / More 高

“导入、导出、项目”不要继续永久展示。
收进：
•••

打开后：
Project
Import
Export
────────
Project Backup

这样 Top Bar 保持非常干净。
Preview
测试路线 是目前编辑器的重要功能，因此保留为 Top Bar 唯一明显的 Primary Action。
视觉上：
╭──────────────╮
│ ▶ Preview │
╰──────────────╯

采用轻蓝 Liquid Glass。3. Level Panel 蓝图
当前的 LevelTree 功能没问题，但视觉结构要完全改变。
顶部：
LEVELS ＋

下面：
CHAPTER 01

01
02
● 03 ···

CHAPTER 02

01
02

不要：
[ 新建 ][ 复制 ][ 尺寸 ][ 删除 ]

永久堆在顶部。
改为两个层级：
＋

只负责新建。
当前关卡 Hover 时出现：
···

菜单：
Duplicate
Resize
────────
Delete

这样左栏会干净非常多。
当前关卡
选中状态不是传统蓝色矩形。
推荐：
╭─────────────────────╮
│ ● 03 │
╰─────────────────────╯

背后存在轻微 Liquid Lens。
Lens 可以在切换关卡时：
03
↓
04

垂直滑动过去。
时间：
180–220ms

4. Canvas 蓝图
   Canvas 是整个软件最稳定的一层。
   推荐结构：
   ┌──────────────────────────────────────┐
   │ │
   │ Grid / Map Content │
   │ │
   │ │
   │ │
   │ │
   │ │
   │ │
   │ Floating Tool Dock │
   │ │
   └──────────────────────────────────────┘

不要为了 Liquid Glass 给 Canvas：
大圆角
强阴影
大量 glow

Canvas 视觉只应该承担：
地图
网格
选择
路线
校验
模拟

Canvas 周围允许非常轻的：
1px Inner Border

颜色：
rgba(255,255,255,.05)

这样它像一个真正的编辑工作区域。5. Tool Dock 蓝图
这个组件会成为整个项目最明显的视觉记忆点。
位置：
Canvas
Bottom Center
距 Canvas 底部 18px

结构：
╭────────────────────────────────╮
│ ↖ ━ S E ◇ ⌫ │
╰────────────────────────────────╯

建议工具对应：
Icon 功能
↖ Select
━ Path
S Spawn
E End
◇ Tower
⌫ Eraser

鼠标 Hover 才显示 Tooltip：
Path
Shortcut: 2

Liquid Lens
Dock 里面始终只有一个 Active Lens。
例如 Path：
╭────╮
↖ │ ━ │ S E ◇ ⌫
╰────╯

切换 Tower：
Lens 拉伸
↓
────────────────→
↓
╭────╮
↖ ━ S E │ ◇ │ ⌫
╰────╯

这是真正值得投入 Liquid Glass 折射效果的地方。6. Inspector 蓝图
右侧 Inspector 是信息密度最高的区域，因此玻璃效果必须最克制。
顶部：
INSPECTOR

Junction
X 12 · Y 8

下面不是 Card，而是 Section。
BASIC
────────────────────

Type Junction
Position 12, 8
ID junction_04

CONNECTIONS
────────────────────

From Left

Up 0.50
Right 0.50

ADVANCED
────────────────────

...

DANGER ZONE
────────────────────

Delete Junction

Section 间距：
20–24px

Section Label：
11px
uppercase
muted

这会让 Inspector 很像专业生产工具，而不是后台表单。7. Inspector 控件布局
属性尽量使用左右结构。
不要：
位置
[12]

X
[12]

Y
[8]

推荐：
Position X 12 Y 8

普通：
Name Spawn_01
Move Speed 0.5 s
Locked ◉

也就是说，右侧 Inspector 要尽可能压缩垂直空间。
因为它不是网页表单。
它是 Inspector。8. Route Preview 状态蓝图
点击：
▶ Preview

之后 Canvas 进入 Preview Mode。
右上角出现：
╭────────────────────────╮
│ ROUTE PREVIEW │
│ │
│ Spawn spawn_01 │
│ Target end_01 │
│ │
│ Time 2.4 / 6.8s │
│ Progress 12 / 34 │
│ │
│ ━━━━━━━━━━━━━━ │
│ │
│ Stop Close │
╰────────────────────────╯

位置：
Canvas Top Right
16px

宽度：
240–260px

材质：
G2

出现动画：
opacity 0 → 1
translateY -4px → 0
scale .98 → 1

约：
180ms

9. Validation 蓝图
   默认不显示大面板。
   Status Bar：
   ✓ Validation

错误：
● 3 Errors △ 2 Warnings

点击：
Validation Drawer

从 Canvas 下方浮起：
┌──────────────────────── Canvas ───────────────────────┐
│ │
│ │
│ │
│ ╭───────────────────────────────────────────────────╮ │
│ │ VALIDATION × │ │
│ │ │ │
│ │ ● Missing End X 12 Y 9 │ │
│ │ ● Invalid Spawn X 4 Y 2 │ │
│ │ △ Junction Weight X 8 Y 3 │ │
│ ╰───────────────────────────────────────────────────╯ │
└───────────────────────────────────────────────────────┘

高度：
240–320px

最大不超过 Canvas 高度：
40%

点击某个错误：
Validation List
↓
Canvas Cell

对应单元格进行：
Focus Ring + very short pulse

而不是强闪烁。10. Status Bar 蓝图
这是很多编辑器都会有、但现在你的项目缺少的一层。
结构：
╭────────────────────────────────────────────────────────────────────╮
│ Path Tool X 12 Y 8 Grid 20×20 ✓ Saved ✓ Valid │
╰────────────────────────────────────────────────────────────────────╯

左：
Current Tool
Cursor Grid Position

中：
Grid Size

右：
Save State
Validation

以后还可以自然增加：
Zoom
FPS
Project State

而不污染 Top Bar。11. Dialog 蓝图
所有 Dialog 统一。
例如 New Level：
Background
↓
blur + dark translucent backdrop

              ╭────────────────────╮
              │ NEW LEVEL          │
              │                    │
              │ Chapter      [ 1 ] │
              │ Stage        [ 3 ] │
              │                    │
              │ Map Size           │
              │ [ 20 ] × [ 20 ]   │
              │                    │
              │      Cancel Create │
              ╰────────────────────╯

尺寸：
Dialog Width
New Level 400px
Resize 440px
Import 480px
Export 440px
Confirm Dangerous Action 380px

Dialog 不超过：
640px

除非以后出现复杂编辑器。12. 危险操作蓝图
删除、覆盖项目、裁切数据都不能直接执行。
例如 Resize 裁切：
╭────────────────────────────────────╮
│ Resize Map │
│ │
│ 20 × 20 → 16 × 16 │
│ │
│ ⚠ This operation will remove: │
│ │
│ Path Cells 12 │
│ Towers 3 │
│ Junctions 1 │
│ │
│ Cancel Resize │
╰────────────────────────────────────╯

危险按钮才使用红色。
不要整个 Dialog 都红。13. Tooltip 蓝图
Toolbar Icon、Tool Dock、Disabled 操作都通过 Tooltip 提供解释。
╭──────────────────╮
│ Draw Path │
│ Shortcut 2 │
╰──────────────────╯
▲
│
━

Tooltip：
G2 Glass

延迟：
350–450ms

显示：
120ms fade

14. Toast / 状态提示蓝图
    尽量少使用 Toast。
    保存成功不应该：
    ✓ 保存成功

每次弹出来。
它应该只在 Status Bar：
Saving...
↓
✓ Saved

真正需要 Toast 的情况：
Import succeeded
Export generated
Unexpected error

位置：
Top Right
Top Bar 下方 12px

尺寸短小。15. 页面 Z 层级
正式规定：
Layer Z 内容
Workspace 0 App Background
Canvas 10 Map
Side Panel 20 Level / Inspector
Floating UI 30 Tool Dock / Preview
Drawer 40 Validation
Backdrop 50 Modal Backdrop
Dialog 60 Dialog
Tooltip 70 Tooltip
Toast 80 Toast

这样以后不会出现：
Route Preview 被 Inspector 压住
Tooltip 被 Dialog 截掉

这种问题。16. 页面主要状态
最终 UI 至少要设计这 5 种状态。
状态 页面变化
Normal Editing 标准三栏
Object Selected Inspector 展示属性
Route Preview Preview Panel + Canvas Route
Validation Open Bottom Drawer
Modal Open Backdrop + Dialog

它们不能彼此冲突。
例如：
Modal Open

时：
Tool Dock
Level
Inspector
Canvas

全部禁止交互。
Preview 可以保留在视觉上，但不能继续操作。17. 面板开合策略
桌面默认：
Level Open
Inspector Open

但允许折叠。
左边：
◀

右边：
▶

折叠后：
Level 228px → 0
Inspector 336px → 0

Canvas 自动扩大。
动画：
220ms

这对于之后真正编辑大地图会非常有价值。18. 窗口宽度策略
这个项目本质是桌面工具，不应该为了所谓“响应式”强行适配手机。
建议正式规定：
Width 布局
≥ 1280 完整模式
1100–1279 Compact
900–1099 Side Panel 可覆盖
< 900 不作为主要目标

Compact：
Level 200
Inspector 300

工具 Dock 不变化。
不要把按钮缩得越来越小。19. 1920×1080 下的效果
大屏不要变成：
巨大 Sidebar
巨大 Inspector

应该是：
228px 1fr Canvas 336px

所以 1920 下大约：
Canvas ≈ 1308px

视觉上会非常舒服。
这也是编辑器类型布局的正确扩展方式。20. 整个页面的视觉重心
最终构图应该形成：
Top Bar
↓

Level ───────── CANVAS ───────── Inspector
↑
Tool Dock

                 ↓
              Status

重要程度：
Canvas 100
Tool Dock 80
Inspector 70
Level Tree 55
Top Bar 45
Status Bar 30

不要让 Top Bar 成为页面最抢眼的部分。21. 最终界面概念效果
我希望最终打开项目时，整体感觉是：
深色的编辑空间。

中间地图非常清晰。

左边关卡和右边属性像两片悬浮的暗色玻璃。

底部中央漂浮着一块 Liquid Glass 工具 Dock。

鼠标移动时只有正在交互的东西轻微响应。

切换工具，一枚透明液态 Lens 平滑滑动。

运行路线测试时，Canvas 上出现青色运动反馈，
右上角浮现一块薄薄的玻璃状态窗口。

平时整个界面是安静的。
只有用户发生操作时，它才“活起来”。
