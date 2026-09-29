TDPE Component Blueprint v1
它的核心原则仍然不变：
Canvas 是内容层，Glass 是控制层，Liquid 是交互焦点。

下面所有组件都围绕这三个层次展开。

1. 全局组件状态规范
   先统一所有组件共有的状态语言。
   状态 视觉变化 动画 使用场景
   Default 基础透明度、基础高光 无 静止状态
   Hover 亮度 +3~~6%，高光增强 80–120ms 鼠标经过
   Pressed Scale 0.97~~0.985 80ms 鼠标按下
   Active Liquid Lens / Accent 180–260ms 当前选中
   Focus Cyan Focus Ring 120ms 键盘焦点
   Disabled opacity 40~50% 无 不可操作
   Loading 微型动态状态 250ms+ Saving / Testing
   Success Soft Green/Cyan pulse 300ms 成功
   Warning Amber accent 180ms 警告
   Error Red accent + 短促 pulse 180ms 错误

以后任何组件都不能自己发明一套状态。2. TopBar 组件蓝图
TopBar 是 G2 Floating Glass。
基础结构
╭──────────────────────────────────────────────────────╮
│ TDPE Chapter 01 / Stage 03 ↶ ↷ ✓ Saved ▶ │
╰──────────────────────────────────────────────────────╯

尺寸
属性 定义
Height 48px
Radius 16px
Padding X 12px
Gap 8px
Blur 24px
Background rgba(24,30,40,.52)
Border rgba(255,255,255,.10)

状态
状态 表现
Default 稳定玻璃
Hover 子按钮 局部亮度增加
Active Preview 蓝色 Liquid Surface
Saving Saved 文本切换为 Saving…
Save Success Cyan → Muted
Save Error Red

TopBar 本身不应该整体动画。
只允许内部组件响应。3. IconButton 蓝图
这是整个项目里使用频率最高的基础组件。
例如：
↶
↷
⋯
× +

尺寸
类型 Size
Compact 28×28
Normal 32×32
ToolDock 36×36

Default
透明背景
Icon secondary

Hover
rgba(255,255,255,.06)

轻微 Specular：
top edge highlight

Pressed
scale(.94)

Active
Liquid Lens

不是直接把背景变蓝。4. ToolDock 蓝图
这是视觉重点组件。
整体：
╭────────────────────────────────────╮
│ ↖ ━ S E ◇ ⌫ │
╰────────────────────────────────────╯

Container
属性 定义
Height 44px
Radius 20px
Padding 4px
Gap 2px
Glass G2
Blur 26px
Refraction Medium
Shadow Medium

每个 Tool：
36×36px

5. ToolDock Liquid Lens
   真正的 G3。
   假设当前 Path：
   ╭────╮
   ↖ │ ━ │ S E ◇
   ╰────╯

Lens 视觉
参数 定义
Background rgba(77,163,255,.16)
Border rgba(180,220,255,.24)
Blur 10px
Refraction High
Specular High
Radius 14px
Glow 0 0 16px rgba(77,163,255,.08)

工具切换动画
例如：
Path → Tower

分为三个阶段：
时间 动作
0–60ms Lens 横向轻微拉伸
60–190ms Lens spring 移动
190–240ms 微 overshoot
240–280ms 稳定

Lens 宽度可以：
36px
↓
42px
↓
36px

这就是“液态感”，而不是单纯 translate。6. Hover Tooltip 产品决策
当前产品不使用自定义 Hover Tooltip，也不使用原生 title 代替。

IconButton 必须提供准确的 aria-label。
快捷键、Disabled 原因或其他必要说明应使用可见文案、Popover、Dialog 或帮助文档表达，不能只在鼠标悬停时显示。
未经新的产品决策与设计系统修订，不得重新引入 Hover Tooltip。7. LevelPanel 蓝图
G1。
顶部：
LEVELS +

Panel
属性 定义
Width 228px
Radius 12px
Padding 12px
Blur 18px
Background rgba(18,24,33,.68)

LevelPanel 本身尽量安静。
不做明显 Glow。8. Chapter Header 蓝图
CHAPTER 01

属性 定义
Font 11px
Weight 600
Letter spacing .06em
Color Muted
Margin top 16px

Chapter Header 不需要任何互动动画。9. LevelItem 蓝图
默认：
03

Hover：
╭──────────────────╮
│ 03 ⋯ │
╰──────────────────╯

Active：
╭──────────────────╮
│ ● 03 │
╰──────────────────╯

尺寸
参数 定义
Height 30px
Radius 8px
Padding X 8px

Active Lens
用低强度 G3。
不要使用高折射。
Active Level 的动画应该是：
当前 item highlight
↓
纵向滑动
↓
新 item

Duration：
180–220ms

10. LevelItem More Menu
    Hover 后显示：
    ⋯

点击：
╭────────────────────╮
│ Duplicate │
│ Resize │
│ ───────────────── │
│ Delete │
╰────────────────────╯

Menu 使用 G2。
Menu
属性 定义
Width 160px
Radius 10px
Padding 6px
Row Height 30px
Shadow Medium

出现动画：
opacity + scale .97 → 1

140ms。11. Inspector 蓝图
Inspector 使用 G1，而且视觉必须比 ToolDock 更克制。
顶部：
INSPECTOR

Junction
X 12 · Y 8

Panel
属性 定义
Width 336px
Radius 12px
Padding 14–16px
Blur 18px
Scrollbar Thin

Inspector 不允许大面积 glow。12. InspectorSection 蓝图
CONNECTIONS
────────────────

Section Header
参数 定义
Font 11px
Weight 600
Uppercase Yes
Letter spacing .06em
Text Muted
Separator 1px subtle

Section 上下间距：
20–24px

这是右侧信息层级的核心。13. PropertyRow 蓝图
标准：
Type Junction
Position 12, 8
ID junction_01

布局
左侧 右侧
40–45% 55–60%
Muted Primary

Height：
28–30px

不要给每行加 border。
只靠：
spacing
text hierarchy

形成结构。14. TextInput 蓝图
普通输入：
╭──────────────────╮
│ 0.50 │
╰──────────────────╯

参数
属性 定义
Height 32px
Radius 8px
Padding 8px
Background rgba(255,255,255,.04)
Border rgba(255,255,255,.08)

状态
Default：
低对比边框

Hover：
border opacity +20%

Focus：
border #4DA3FF
0 0 0 3px rgba(77,163,255,.10)

Error：
border #EF4444

Disabled：
opacity .45

15. NumberInput 蓝图
    类似：
    [ 0.50 ] s

或：
[ − ] 12 [ + ]

后续如果数值频繁调节，可以增加 stepper。
但现在第一版建议保持普通 input。
原因是编辑器 UI 应该先稳定，不要过早增加花哨控件。16. Toggle 蓝图
这是 Liquid Glass 最适合的组件之一。
Off：
╭──────────╮
│ ● │
╰──────────╯

On：
╭──────────╮
│ ● │
╰──────────╯

Track
状态 背景
Off rgba(255,255,255,.08)
On rgba(77,163,255,.28)

Thumb
G3 Liquid Lens。
尺寸：
20–22px

动画：
180–220ms spring

允许轻微：
stretch → move → settle

这可以直接参考你之前给的 Liquid Switch。17. Checkbox 蓝图
不要把所有 checkbox 都做成 Liquid。
Checkbox 更适合轻量。
Unchecked：
□

Checked：
▣

视觉：
18×18
radius 5px

选中：
Blue/Cyan

动画只需要：
check scale 0.8 → 1

120ms。18. Button 蓝图
统一四类。
Button 视觉
Primary G2/G3 Blue Liquid
Secondary 低对比 Glass
Ghost Transparent
Danger Dark + Red accent

19. Primary Button
    例如：
    ▶ Preview

Default：
Blue glass

Hover：
specular ↑
refraction ↑
brightness ↑

Pressed：
scale .97

Focus：
cyan ring

Disabled：
opacity .40
no glow

尺寸
Size Height
Small 28px
Normal 32px
Large 36px

Editor 默认使用：
32px

20. Secondary Button
    例如：
    Cancel
    Import
    Export

背景：
rgba(255,255,255,.04)

Hover：
rgba(255,255,255,.08)

不做强折射。21. Ghost Button
Toolbar 中：
↶
↷
×

默认完全透明。
Hover 才出现玻璃 surface。
它应该是整套 UI 中最安静的 Button。22. Danger Button
例如：
Delete Junction
Replace Project

不要默认纯红底。
推荐：
dark surface +
red text

Hover：
rgba(239,68,68,.10)

只有最终确认按钮：
Confirm Delete

才允许使用：
rgba(239,68,68,.22)

23. Slider 蓝图
    以后如果 Junction 权重等适合 Slider：
    ──────────●────────

Track：
2px

Active Track：
Blue/Cyan

Thumb：
G3 Liquid Lens

Thumb Hover：
scale 1 → 1.12

Drag：
slight glow

Release：
spring settle

这比传统 HTML range 更符合整体。24. SegmentedControl 蓝图
以后非常适合：
[ Edit | Preview ]

或：
[ Errors | Warnings ]

结构：
╭────────────────────╮
│ Edit Preview │
│ ╰────╯ │
╰────────────────────╯

Active 背景使用 G3 Lens。
和 ToolDock 共用同一种 Liquid Motion。25. Dialog 蓝图
统一 BaseDialog。
结构：
╭──────────────────────────────╮
│ Title │
│ Subtitle │
│ │
│ Content │
│ │
│ Cancel Confirm │
╰──────────────────────────────╯

参数
属性 定义
Radius 14px
Glass G1
Blur 20px
Shadow Strong
Padding 16px

进入：
opacity 0 → 1
scale .97 → 1
translateY 6px → 0

180ms。
退出：
140ms

退出应该比进入略快。26. Modal Backdrop
Backdrop：
rgba(4,8,13,.55)

加：
blur 3–4px

不要做过强 blur，否则用户失去空间感。27. ValidationDrawer 蓝图
默认关闭。
打开后：
╭────────────────────────────────────╮
│ VALIDATION 3 Errors × │
│ │
│ ● Missing End X12 Y9 │
│ ● Spawn Invalid X4 Y2 │
│ △ Weight Sum X8 Y3 │
╰────────────────────────────────────╯

G1。
Drawer 动画
translateY 12px → 0
opacity 0 → 1

220ms。
不要做整块从屏幕底部滑很远。28. ValidationItem 蓝图
Error：
● Missing End
X12 Y9

Warning：
△ Junction Weight

Hover
background ↑

Focus
left accent 2px +
soft red/amber surface

点击后：
Canvas 对应格子短 pulse。29. RoutePreviewPanel 蓝图
G2。
╭─────────────────────╮
│ ROUTE PREVIEW │
│ │
│ Spawn spawn01 │
│ Target end01 │
│ Time 2.4s │
│ │
│ ━━━━━━━━━━━ │
│ │
│ Stop Close │
╰─────────────────────╯

Panel 要比 Inspector 更轻、更透明。
因为它是临时状态层。30. ProgressBar 蓝图
Route Preview 使用：
━━━━━━━━━━━━━━

Height：
3px

Background：
rgba(255,255,255,.08)

Active：
#49D9E8

可以加一个非常弱的 moving highlight。
不要做霓虹光条。31. StatusBar 蓝图
Path Tool X12 Y8 Grid 20×20 ✓ Saved ✓ Valid

Height：
32px

G1 / very light G2。
StatusBar 是信息层，不是视觉重点。
文字主要使用：
11–12px

32. SaveStatus 蓝图
    状态：
    状态 表现
    Loading Loading…
    Saving 小点动画 + Saving
    Saved ✓ Saved
    Error ● Save Failed

Saved 不需要一直绿色。
推荐：
成功瞬间 Cyan
↓ 500ms
回 Muted

避免界面长期彩色。33. Toast 蓝图
Toast 尽量少。
结构：
╭─────────────────────╮
│ ✓ Export completed │
╰─────────────────────╯

G2。
参数
属性 定义
Width 240–320px
Radius 10px
Duration 2.5–4s

进入：
opacity
translateY -4px

退出：
fade

34. EmptyState 蓝图
    现在的：
    未选择对象
    选择地图元素后将在此显示属性

以后可以更精简：
No Selection

Select an element on the canvas
to inspect its properties.

视觉：
Icon
↓
Title
↓
Description

但 Icon 必须非常弱。
不需要大插画。35. Scrollbar 蓝图
整个编辑器必须统一。
宽度：
6px

Track：
transparent

Thumb：
rgba(255,255,255,.12)

Hover：
rgba(255,255,255,.22)

Radius：
999px

36. ContextMenu 蓝图
    以后 Canvas 右键很可能使用。
    G2。
    ╭──────────────────╮
    │ Delete │
    │ Duplicate │
    │ ─────────────── │
    │ Properties │
    ╰──────────────────╯

与 Level More Menu 共用基础组件。37. Loading / Busy 状态
如果 Route Preview、Import 等产生短暂操作：
不建议全屏 Loading。
优先：
Button 内 spinner

或者：
StatusBar

只有整个 Editor 无法操作时才考虑 Overlay。38. Motion Token
把动画正式 Token 化。
Token Duration 用途
motion.fast 100ms Hover
motion.normal 180ms Popover/Input
motion.panel 220ms Drawer/Panel
motion.liquid 260ms Lens
motion.modal 180ms Dialog

Easing：
standard
cubic-bezier(.2,.8,.2,1)

Liquid：
spring-like

后面可以通过 CSS 或 JS motion 实现。39. Liquid Effect 使用白名单
非常重要。
真正 Liquid Refraction 只允许出现在：
允许 不允许
Tool Active Lens Inspector 大面积背景
Toggle Thumb Validation List
Segmented Indicator 普通文本输入区
Primary Button Canvas
Slider Thumb Scroll Panel
Floating Toolbar 每一个普通按钮
Route Preview Controls Error Message

这是控制整体质感的关键。40. 最终组件体系关系
后面代码层最好最终形成这种结构：
GlassSurface
├─ GlassPanel
├─ FloatingBar
├─ Popover
└─ Dialog

Control
├─ IconButton
├─ Button
├─ Input
├─ Toggle
├─ Checkbox
└─ Slider

Liquid
├─ LiquidLens
├─ ToolIndicator
└─ SegmentIndicator
