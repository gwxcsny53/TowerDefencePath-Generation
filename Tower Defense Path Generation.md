## Tower Defense Path Generation

塔防路径生成

# 设计说明

网页端可编辑操作的塔防可视化编辑生成器

# 功能说明

@ 1.可以导入已经配置好的json数据来读取生成可视化显示
@ 2.可以编辑后导出为程序可读的json数据
@ 3.需要支持关卡系统, 例如章节,关卡 ,在网页端需要显示 在编辑的章节,关卡.需要可以直接更改章节关卡
@ 4.新建地图配置, 点击新建按钮,出现章节和关卡填入,总网格数(长多少,宽多少),点击后进入编辑
@ 5.对于导入的配置,需要显示出列表,章节对应关卡
@ 6.编辑地图,需要现在侧边栏选择类型 : 浅黄色 = 路线,绿色 = 出怪点,红色 = 终点,棕色= 塔的节点.
@ 7.编辑地图,对于路线相交时的 分叉路/十字路/汇合路 上面需要支持单独配置, 例如分叉路的权重(0.8,0.2)80%走上分叉路,20%走下分叉路
@ 8.编辑地图, 对于塔的节点,需要支持配置,主要为 lock ,代表初始是否解锁
@ 9.编辑地图, 对于十字路口的点,需要配置可出的方向,哪些方向时进入的,哪些方向是往外出的.
@ 10.编辑地图, 对于 分叉路/十字路/汇合路 可以做统一的数据类型配置,不需要做类型的区分.
@ 11.编辑地图, 可以设置多个出怪点.
@ 12.编辑地图, 建议支持 Resize,修改地图尺寸,规定缩小时如果裁掉已有内容必须二次确认,拓宽和缩小均向外增加,规定左上角(0,0),
增加列 → 右边增加
减少列 → 右边删除

增加行 → 下边增加
减少行 → 下边删除
@ 13.编辑地图, 需要 撤销 / 重做,撤销(Ctrl+Z)
@ 14.增加“路线预览模式” , 点击 ▶ 测试路线 , 然后从绿色出怪点出现一个小圆点：
Spawn
↓
沿路线运动
↓
遇到分叉
↓
按照权重随机
↓
End
@ 15.编辑地图, 不支持斜线,路线宽度固定为 1 格,Spawn/End 必须位于路线端点；TowerNode 不能和路线重叠
@ 16.编辑地图, 禁止怪物存在重新走回已经经过节点的可能,“禁止有向移动规则形成循环”

# 格式参考

json:
{
"version": 1,

"level": {
"chapter": 1,
"stage": 3
},

"grid": {
"rows": 20,
"cols": 20
},

"pathCells": [
{ "x": 2, "y": 0 },
{ "x": 2, "y": 1 }
],

"spawnPoints": [
{
"id": "spawn_01",
"x": 2,
"y": 0
}
],

"endPoints": [
{
"id": "end_01",
"x": 15,
"y": 17
}
],

"junctions": [],

"towerNodes": []
}

pathCells= 哪些格子可以走;
spawnPoints= 哪些路线格子具有出生功能;
endPoints= 哪些路线格子具有终点功能;
junctions = 某个路线格子的移动规则;
towerNodes = 非路线上的塔位;

towerNodes 需要一个是否锁定的属性{
"locked": true
}

interface TowerNode {
id: string;
x: number;
y: number;
locked: boolean;
}

关于junctions

- type Direction = 'up' | 'down' | 'left' | 'right';
- interface Junction {
-     id: string;
-     x: number;
-     y: number;
-     transitions: {
-         enterFrom: Direction;
-         exits: {
-             exitTo: Direction;
-             weight: number;
-         }[];
-     }[];
- }

enterFrom 定义为：
Junction 坐标：(5, 5)
enterFrom = left
怪物进入 Junction 前所在的格子，在 Junction 左侧。
previous = (4, 5)
current = (5, 5)

enterFrom = left

# 详细

一、地图数据定义

- 坐标系
- pathCells
- SpawnPoint
- EndPoint
- TowerNode
- Junction
- JSON Version

enum EditorTool {
Path = 'path',
Spawn = 'spawn',
End = 'end',
Tower = 'tower',
Eraser = 'eraser',
}

二、编辑器功能

- 新建
- 导入
- 导出
- 绘制
- 擦除
- 修改尺寸
- Undo / Redo
- 关卡复制 / 删除
- 路口配置

三、校验与预览

- 路线连通性检查
- 路口合法性检查
- 权重检查
- 冲突检查
- 路线模拟
