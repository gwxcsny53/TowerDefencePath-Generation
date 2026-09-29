## 一个深色、安静、精密的游戏关卡编辑工作台。界面本身采用透明液态玻璃作为控制层，而游戏数据和 Canvas 保持清晰、稳定、实体化。玻璃负责交互，Canvas 负责内容。

核心不是“把所有东西变透明”，而是建立一套有层级的玻璃材质、交互动画和信息密度规则。最终目标是：第一眼现代、有质感；长时间使用不累；Canvas 永远是视觉主体；所有动画都在帮助理解状态，而不是单纯炫技。
一、整体视觉方向
维度 定义 设计要求
整体风格 Dark Liquid Glass 深色工作区 + 悬浮玻璃层
核心气质 专业、现代、流体、精密 不做赛博朋克，不做强霓虹
主视觉 Canvas UI 永远不能抢 Canvas
材质语言 半透明、折射、柔和高光 避免纯 blur 毛玻璃
交互语言 Fluid + Spring 尽量避免生硬的瞬时切换
信息密度 中高密度 符合编辑器，而不是展示型网页
主色 冷色 Blue / Cyan 只做关键高亮
错误/警告 Red / Amber 不参与普通装饰
圆角 中等偏柔和 不做“大圆角卡片网页”
阴影 柔和、低对比 主要用于悬浮层级

最终应更像：
一块深色精密工作台 +
几片悬浮透明玻璃 +
液态滑动的交互指示器 +
Canvas 中清晰的地图内容

二、玻璃材质分级
这是整个 UI 最重要的一套规则。
我建议不要只做一个 glass 样式，而是定义 4 个等级。
等级 名称 使用位置 折射强度 Blur 透明度 动画强度
G0 Workspace Canvas 背景、主工作区 无 无 不透明 无
G1 Glass Surface 左侧面板、Inspector、Dialog 极弱 中 中等 极轻
G2 Floating Glass Topbar、Tool Dock、Route Preview 中 中高 偏透明 中
G3 Liquid Lens Active Tab、Toggle、按钮状态、Slider 强 低~中 高透明 强

这个层级非常关键。
如果所有面板都用 G3，你的界面会变成“玻璃玩具”。
正确效果应该是：
G0 工作空间
↓
G1 信息面板
↓
G2 悬浮工具
↓
G3 当前交互焦点

视觉焦点自然形成。
三、颜色系统
我建议不要直接用纯黑，而是采用非常深的冷灰蓝。
基础环境色
Token 建议颜色 用途
bg.app #080B10 最底层背景
bg.workspace #0B0F15 Canvas 外围
bg.canvas #0E131B Canvas 基础背景
surface.dark #121821 不透明辅助面
surface.hover #18212D 普通 Hover
border.subtle rgba(255,255,255,0.08) 微弱分割线

文字系统
Token 建议颜色 用途
text.primary #F4F7FB 主标题/重要文字
text.secondary #B7C0CC 普通内容
text.muted #7E8998 辅助信息
text.disabled #505A67 Disabled
text.inverse #071018 亮色按钮上的字

不要出现大量纯白。
真正的纯白应该只出现在：
最重要标题
高亮 icon
specular 高光

四、Accent 系统
推荐主 Accent 使用蓝青之间，而不是传统 Bootstrap 蓝。
用途 色值建议
Primary #4DA3FF
Primary Bright #76C4FF
Cyan Accent #49D9E8
Soft Glow rgba(77,163,255,0.22)
Active Surface rgba(77,163,255,0.14)

但整个编辑器不能到处发蓝光。
推荐控制在：
90% 中性色
8% 蓝 / 青
2% 状态色

这会比“科技蓝 UI”高级很多。
五、玻璃材质具体参数
这是后面实现时最需要固定下来的部分。
G1 — Glass Surface
用于：

- Level Tree
- Inspector
- Dialog
- Validation Drawer
  属性 建议
  Background rgba(18,24,33,0.68)
  Blur 16–20px
  Saturation 110–120%
  Border rgba(255,255,255,0.08)
  Inner Highlight 顶部/左侧极弱
  Shadow 0 12px 40px rgba(0,0,0,.18)
  Radius 12px

重点：
看起来是玻璃，但不能影响阅读。

G2 — Floating Glass
用于：

- 顶部工具栏
- Tool Dock
- Route Preview
- Floating Context Toolbar
  属性 建议
  Background rgba(28,34,44,0.52)
  Blur 22–28px
  Refraction 中等
  Border rgba(255,255,255,.12)
  Specular 明显但窄
  Shadow 0 12px 36px rgba(0,0,0,.3)
  Radius 16–20px

G2 是真正体现 Liquid Glass 气质的位置。
G3 — Liquid Lens
用于：

- 当前工具
- Toggle thumb
- Segmented Control
- Slider
- Active Tab
- Hover Lens
  属性 建议
  Background rgba(100,170,255,.14)
  Refraction 强
  Blur 8–14px
  Specular 明显
  Glow 极弱
  Shape Capsule / Squircle
  Spring 强

它应该产生：
像一颗透明液体滑块在 UI 上移动。

六、主界面布局定义
原来：
Top Toolbar
Level Tree | Canvas | Property
ToolPalette
Validation

建议正式改成：
┌──────────────────────────────────────────────────┐
│ Floating Top Bar │
│ │
│ ╭────────╮ ╭─────────────╮ │
│ │ Levels │ │ Inspector │ │
│ │ │ Canvas │ │ │
│ │ │ │ │ │
│ ╰────────╯ ╰─────────────╯ │
│ │
│ ╭────────────────────╮ │
│ │ Floating Tools │ │
│ ╰────────────────────╯ │
│ │
│ Status Validation ● │
└──────────────────────────────────────────────────┘

具体尺寸建议
区域 建议
Top Bar 44–48px
左侧 Level 220–240px
Inspector 300–340px
Tool Dock 40–44px 高
Status Bar 28–32px
Canvas 外边距 12–16px
Panel 距边缘 12px

不要让左右面板直接贴死窗口边缘。
留出 12px 空间以后，才会真正产生“悬浮玻璃”的感觉。
七、Top Bar 视觉定义
建议 Top Bar 不再是一整条深色实心栏。
改成悬浮 Glass Bar。
结构：
╭─────────────────────────────────────────────────────╮
│ TD Path Editor Chapter 1 / Stage 3 ✓ Saved │
│ │
│ ↶ ↷ Validate ▶ Preview │
╰─────────────────────────────────────────────────────╯

交互层级：
元素 样式
Logo/名称 Text Primary
当前关卡 Muted
保存状态 极弱状态提示
Undo/Redo Ghost
Validate Secondary
Preview Primary Glass
Import/Export More Menu

我甚至建议把：
导入
导出
项目

收进：
•••

否则 Topbar 会过度拥挤。
八、Tool Dock 定义
这是整套 UI 的“明星组件”。
建议做成：
╭────────────────────────────────────────╮
│ ↖ ━ S E ◇ ⌫ │
╰────────────────────────────────────────╯

每个 Tool 都不是独立按钮。
底层是一整块 Glass Dock。
上面有一个：
Liquid Active Lens

例如：
[ ↖ ][ ━ ][ S ][ E ][ ◇ ][ ⌫ ]
╰──────╯
Lens

切换：
Path → Spawn

Lens 不是消失再出现，而是：
滑动 + 拉伸 + 收缩

动画可以这样定义：
阶段 动画
起始 当前 Lens 拉长
移动 Spring 滑动
到达 稍微 overshoot
稳定 回弹到标准宽度

时间：
180–260ms

这是整个 UI 最能体现 Liquid 的地方。
九、Level Tree 定义
Level Tree 不应该继续是：
第 1 章
[第 1 关]
[第 2 关]

大量边框按钮。
建议改成：
LEVELS ＋

CHAPTER 01
01
02
03 ●

CHAPTER 02
01
02

Selected Level：
╭──────────────────╮
│ 03 │
╰──────────────────╯

用一个很轻的 Liquid Highlight。
操作菜单：
•••

里面：
复制
调整尺寸
删除

不要永久暴露 4 个小按钮。
这会明显提升专业感。
十、Inspector 定义
Inspector 不建议大量 Card。
使用：
Section + Separator

例如：
INSPECTOR

Junction

Position
X 12
Y 8

──────────────────

Connections

From Left
[ Up 0.50 ]
[ Right 0.50 ]

──────────────────

Advanced

...

──────────────────

Delete Junction

Section Header：
12px uppercase / muted

内容：
13px

重要值：
14px / primary

这样看起来会非常接近现代专业工具。
十一、Input 视觉定义
普通 Input：
╭────────────────────────────╮
│ value │
╰────────────────────────────╯

但不能有很明显的白色 border。
定义：
状态 表现
Normal 深透明背景
Hover 背景略亮
Focus Blue/Cyan outer ring
Invalid Red ring
Disabled 降低透明度

推荐：
height: 32px
radius: 8px
border: 1px rgba(255,255,255,.08)

Focus：
border #4DA3FF
shadow 0 0 0 3px rgba(77,163,255,.12)

十二、Button 系统
只定义四种。
类型 使用
Primary Glass 最重要动作
Secondary 普通操作
Ghost Toolbar / 图标
Danger 删除 / 覆盖

Primary 不应该是传统蓝色实心矩形。
而应该是：
半透明蓝色 Liquid Button

例如：
╭────────────╮
│ ▶ Preview │
╰────────────╯

Hover：
玻璃亮度 ↑
refraction ↑
specular ↑

Pressed：
scale .97

Release：
spring → 1

十三、Dialog 定义
Modal 应该是：
Backdrop +
G1 Glass Panel

背景不要纯黑。
推荐：
rgba(4,8,13,.55) +
backdrop blur 4px

Dialog：
╭───────────────────────────────╮
│ New Level │
│ │
│ Chapter [ 1 ] │
│ Stage [ 3 ] │
│ │
│ Cancel Create │
╰───────────────────────────────╯

动画：
opacity 0 → 1
scale .96 → 1
translateY 6px → 0

时间：
180ms

不要做大幅度弹跳。
十四、Validation 定义
Validation 不应该永久占 160px。
默认：
● Validation

或者：
✓ Valid

位于 Status Bar。
出现错误：
● 3 Errors △ 2 Warnings

点击：
Bottom Glass Drawer

滑出：
╭────────────────────────────────────╮
│ Validation │
│ │
│ ● Missing End X 12 Y 6 │
│ △ Invalid Junction X 9 Y 3 │
│ │
╰────────────────────────────────────╯

错误行 Hover 时 Canvas 对应位置同步高亮。
这比现在独立 160px 面板强很多。
十五、Route Preview 视觉定义
这是第二个非常适合 Liquid Glass 的功能。
Preview 开启：
▶ Preview

按钮按下后：

1. Button 有压缩反馈。
2. Canvas Path 发出轻微 Cyan highlight。
3. Route Marker 进入。
4. 右上角 Preview Glass Panel 淡入。
   Panel：
   ╭────────────────────╮
   │ ROUTE PREVIEW │
   │ │
   │ Spawn S_01 │
   │ Time 2.4s │
   │ Progress 12 / 34 │
   │ │
   │ ━━━━━━━━━━━ │
   │ │
   │ Stop Close │
   ╰────────────────────╯

Marker 本身可以：
轻微呼吸 + Trail

但禁止大 Glow。
十六、动画系统
整个项目统一只使用 4 种 Motion。
类型 用途 时间
Micro Hover / Press 80–120ms
UI Transition Panel / Tooltip 160–220ms
Fluid Movement Lens / Tab 200–320ms
Large Layout Drawer / Dialog 220–320ms

动画曲线：
普通：
cubic-bezier(.2,.8,.2,1)

Liquid：
spring-like

不要使用：
linear
ease-in-out everywhere

十七、交互反馈语言
所有交互统一采用这套层次：
操作 反馈
Hover 亮度 + 微高光
Press scale 0.97
Select Liquid Lens
Drag 元素轻微 lift
Save status fade
Error 短促 highlight
Success Cyan/Green soft pulse
Disabled 降亮度、不发光
Focus 柔和 Focus Ring

禁止：
强烈 shake
闪烁
全屏 glow
长时间动画

十八、Canvas 视觉策略
Canvas 本身不能 Liquid。
Canvas 是“内容层”。
建议：
元素 调整
Grid 深灰细线
Path 蓝色但降低饱和
Spawn Green
End Red
Tower Warm Amber
Junction Violet
Selected Cyan outline
Validation Red / Amber overlay
Preview Cyan

Canvas 里面的颜色必须比 UI 更“实”。
UI 是透明玻璃。
Canvas 是实际数据。
这样两层视觉语言会非常清楚。
十九、圆角系统
不要到处不同 radius。
统一：
Token Radius
radius.control 8px
radius.panel 12px
radius.floating 16px
radius.pill 999px

Tool Dock：
16px / Pill

Dialog：
12–16px

普通 Input：
8px

二十、间距系统
统一：
4 / 8 / 12 / 16 / 24 / 32

而不是再出现：
10px
14px
18px

Panel：
padding 12 / 16

Inspector row：
8px

Section：
16–24px

二十一、字体标准
我建议继续使用系统字体，不必急着加特殊字体。
级别 Size Weight
Window Title 15–16 600
Panel Title 13–14 600
Body 13 400
Control 13 500
Metadata 11–12 400
Section Label 11 600

Section label 推荐：
uppercase
letter-spacing .06em

例如：
CONNECTIONS
BASIC
VALIDATION

会非常适合编辑器。
二十二、图标系统
建议以后使用统一线性 Icon。
推荐：
Lucide

尺寸：
16px 主流
14px 辅助
18px 重点

Stroke：
1.5–1.75

禁止：
emoji
不同来源 icon
icon + 超长文字

Tool Dock 尽量：
Icon +
Tooltip

而不是始终显示：
出生点
终点
塔位
橡皮擦

这样会明显轻盈很多。
二十三、最终视觉层级
我希望用户看到界面时，视线顺序是：
① Canvas
↓
② 当前工具 / 当前选择
↓
③ Inspector
↓
④ Level Navigation
↓
⑤ Status / Validation
↓
⑥ 其他项目操作

如果最终效果是：
“Topbar 很漂亮、玻璃很多、Canvas 反而不显眼”

那就是设计失败。
二十四、我建议最终定下来的核心组件风格
组件 视觉材质
App Background G0
Canvas G0
Level Tree G1
Inspector G1
Dialog G1
Validation Drawer G1
Top Bar G2
Tool Dock G2
Route Preview G2
Tooltip G2
Active Tool G3
Toggle G3
Slider Thumb G3
Active Tab G3
Primary Button G2/G3
