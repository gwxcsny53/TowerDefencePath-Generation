# Tower Defense Path Editor 实施规划

## 1. 项目定位

本项目是一个纯网页端、可离线使用的塔防关卡路径可视化编辑器。

主要目标：

- 在浏览器中创建、编辑、校验塔防关卡地图。
- 使用二维网格绘制路径、出生点、终点、塔位节点。
- 支持多出生点。
- 支持分叉、汇合、十字路等 Junction 统一配置。
- 支持路线权重与进入/出去方向配置。
- 支持章节 / 关卡管理。
- 支持地图 Resize。
- 支持 Undo / Redo。
- 支持路线模拟预览。
- 支持 JSON 导入、导出。
- 支持浏览器本地保存。
- 最终输出可直接供游戏运行时读取的关卡 JSON。

本项目不依赖服务器，不需要账号系统、数据库或网络接口。

## 2. V1 范围

### 2.1 必须支持

- 新建项目 / 新建关卡。
- Chapter / Stage 管理。
- 网格尺寸配置。
- 路径绘制与擦除。
- SpawnPoint 创建。
- EndPoint 创建。
- TowerNode 创建。
- Junction 自动识别。
- Junction 方向配置。
- Junction 出口权重配置。
- 多 SpawnPoint。
- 地图 Resize。
- Undo / Redo。
- 地图合法性校验。
- 路线模拟。
- 当前关卡 JSON 导入 / 导出。
- 项目本地自动保存。
- 关卡复制 / 删除。

### 2.2 V1 规则

- 左上角为 `(0, 0)`。
- `x` 向右增加，`y` 向下增加。
- 路线只允许上下左右四方向。
- 不支持斜线。
- 路线宽度固定为 1 格。
- SpawnPoint 必须位于路线端点。
- EndPoint 必须位于路线端点。
- TowerNode 不允许与路线重叠。
- Junction 不单独绘制，由路线拓扑自动识别。
- 分叉、汇合、T 字路、十字路统一使用 Junction 数据结构。
- 禁止怪物的有向移动规则形成循环。
- 允许“分叉后重新汇合”这种几何结构，只要移动规则不会无限循环。

### 2.3 V1 暂不实现

- 图片识别。
- 后端服务器。
- 用户登录。
- 云同步。
- 多人协作。
- 数据库。
- 斜向路径。
- 路径宽度大于 1。
- 传送点。
- 多层地图。
- 地形系统。
- 塔位复杂解锁条件。
- 在线发布平台。

## 3. 推荐技术栈

| 技术 | 用途 |
|---|---|
| Vue 3 | 页面、工具栏、属性面板、关卡列表 |
| TypeScript | 核心逻辑与类型约束 |
| Vite | 开发环境与构建 |
| Pinia | 编辑器全局状态 |
| Canvas 2D | 网格地图绘制、交互、模拟显示 |
| Zod | JSON 格式校验 |
| Vitest | Core 层单元测试 |
| IndexedDB | 浏览器本地项目保存 |

V1 不引入 Electron、Tauri、Express、MySQL、SQLite、PixiJS、Phaser、Cocos Creator Editor Extension。

## 4. 总体架构

项目分为五部分：

```text
UI Layer
   ↓
Editor Layer
   ↓
Core Layer
   ↓
Persistence Layer

Renderer Layer 与 Editor/Core 配合负责 Canvas 显示
```

### Core

纯 TypeScript，负责：

- 数据模型
- 路径拓扑
- Graph
- Junction
- Validator
- RouteSimulator
- Runtime 配置转换

Core 不依赖 Vue、Pinia、Canvas、DOM、IndexedDB。

### Editor

负责：

- 当前工具
- 当前选中对象
- 绘制 / 擦除
- Resize
- Undo / Redo
- Command
- 用户编辑行为转为 Core 数据修改

### Renderer

负责 Canvas：

- 网格
- Path
- Spawn / End / Tower
- Junction
- Selection
- Validation 高亮
- Route Simulation

### Persistence

负责：

- IndexedDB
- JSON Import / Export
- Serializer / Deserializer
- Schema Validation

### UI

负责：

- Toolbar
- LevelTree
- MapCanvas
- PropertyPanel
- JunctionPanel
- ValidationPanel
- Dialog

## 5. 核心数据模型

```ts
interface GridPosition {
    x: number;
    y: number;
}

interface SpawnPoint extends GridPosition {
    id: string;
}

interface EndPoint extends GridPosition {
    id: string;
}

interface TowerNode extends GridPosition {
    id: string;
    locked: boolean;
}

type Direction = 'up' | 'down' | 'left' | 'right';

interface JunctionExit {
    exitTo: Direction;
    weight: number;
}

interface JunctionTransition {
    enterFrom: Direction;
    exits: JunctionExit[];
}

interface Junction extends GridPosition {
    id: string;
    transitions: JunctionTransition[];
}

interface LevelConfig {
    version: number;

    level: {
        chapter: number;
        stage: number;
    };

    grid: {
        rows: number;
        cols: number;
    };

    pathCells: GridPosition[];
    spawnPoints: SpawnPoint[];
    endPoints: EndPoint[];
    junctions: Junction[];
    towerNodes: TowerNode[];
}
```

`enterFrom` 定义为：怪物进入 Junction 前所在格子相对于 Junction 的方向。

例如 previous = `(4,5)`、junction = `(5,5)` 时，`enterFrom = left`。

## 6. 编辑器数据与导出数据分离

JSON 中 `pathCells: GridPosition[]` 适合持久化，但编辑器内部建议使用 `Set<string>` 维护 Path，例如：

```text
"5,8"
"6,8"
"7,8"
```

这样添加、删除、查询和邻居判断更直接。

导出：

```text
Editor Model
→ Serializer
→ LevelConfig
→ JSON
```

导入：

```text
JSON
→ Zod
→ Deserializer
→ Editor Model
```

## 7. Project 与 Level 分离

编辑器内部增加 Project 层：

```ts
interface EditorProject {
    id: string;
    name: string;
    levels: LevelConfig[];
}
```

Project 负责章节、关卡、当前编辑状态和本地保存信息。

Runtime LevelConfig 只保存游戏真正需要的数据。

原则：

```text
EditorProject
    ↓ Export
Runtime LevelConfig
    ↓
Game
```

## 8. Grid 与 Graph

地图编辑使用 Grid，路线分析转为 Graph。

GraphBuilder 对每个 Path Cell 检查 up/down/left/right 邻居，并建立邻接关系。

规则：

```text
neighbor = 1 → Endpoint Candidate
neighbor = 2 → Normal Path
neighbor >= 3 → Junction Candidate
```

Junction 不由用户绘制，而是自动识别后再进行规则配置。

## 9. Junction 系统

不区分 Fork、Merge、T Junction、Cross，统一表达：

```text
从哪个方向进入
→ 允许走哪些出口
→ 每个出口的权重
```

如果 Junction 自动识别后未配置，应产生：

```text
JUNCTION_NOT_CONFIGURED
```

## 10. Validator

统一返回：

```ts
interface ValidationIssue {
    severity: 'error' | 'warning';
    code: string;
    message: string;
    position?: GridPosition;
}
```

V1 至少检查：

- GRID_OUT_OF_RANGE
- PATH_ISOLATED
- SPAWN_NOT_ENDPOINT
- END_NOT_ENDPOINT
- TOWER_PATH_CONFLICT
- JUNCTION_NOT_CONFIGURED
- JUNCTION_DIRECTION_INVALID
- JUNCTION_WEIGHT_INVALID
- SPAWN_CANNOT_REACH_END
- ROUTE_CYCLE

UI 只展示 Validator 结果，不承载校验逻辑。

## 11. 有向循环检测

不能简单判断无向 Grid Graph 是否有环。

循环检测应基于：

```ts
interface RouteState {
    x: number;
    y: number;
    enterFrom: Direction;
}
```

从每个 SpawnPoint 遍历所有可能移动状态。若同一路线分支再次访问相同的 `position + enterFrom`，则判定为移动循环。

## 12. RouteSimulator

输入：

```text
LevelConfig
SpawnPoint
```

流程：

```text
Spawn
→ 普通路线
→ Junction
→ 按 transitions / weight 选择出口
→ 继续移动
→ End
```

至少输出 `GridPosition[]`，用于自动测试、路线高亮和小球运动预览。

V1 可选增加固定 Random Seed，便于复现随机路线。

## 13. Canvas 编辑器

Canvas 负责地图区域，不使用大量 DOM Grid。

建议 Renderer：

```text
MapRenderer
├── GridRenderer
├── PathRenderer
├── NodeRenderer
├── JunctionRenderer
├── SelectionRenderer
├── ValidationRenderer
└── SimulationRenderer
```

坐标转换：

```ts
gridX = Math.floor((mouseX - offsetX) / cellSize);
gridY = Math.floor((mouseY - offsetY) / cellSize);
```

为后续缩放和平移预留 `zoom / offsetX / offsetY`。

## 14. 编辑工具

```ts
enum EditorTool {
    Select = 'select',
    Path = 'path',
    Spawn = 'spawn',
    End = 'end',
    Tower = 'tower',
    Eraser = 'eraser'
}
```

EditorTool 只属于编辑器状态，不进入 Runtime JSON。

基本交互：

- 单击绘制。
- 鼠标拖动连续绘制。
- 点击选中对象。
- 点击 Junction 打开属性配置。
- Eraser 删除对应内容。

## 15. Undo / Redo

使用 Command Pattern：

```ts
interface EditorCommand {
    execute(): void;
    undo(): void;
}
```

建议 Command：

- PaintStrokeCommand
- EraseStrokeCommand
- CreateSpawnCommand
- DeleteSpawnCommand
- CreateTowerCommand
- UpdateTowerCommand
- UpdateJunctionCommand
- ResizeMapCommand

拖动绘制的一整笔必须作为一个 Command，而不是每个格子一个 Command。

## 16. Resize

坐标原点固定左上角。

```text
增加 cols → 右侧增加
减少 cols → 右侧删除
增加 rows → 底部增加
减少 rows → 底部删除
```

若缩小会裁掉 Path、Spawn、End、Tower、Junction，必须二次确认。

Resize 必须支持 Undo。

## 17. UI 布局

```text
┌─────────────────────────────────────────────────┐
│ Project / Import / Export / Undo / Redo / Test │
├──────────┬──────────────────────┬───────────────┤
│ Level    │                      │ Property      │
│ Tree     │      Map Canvas      │ Panel         │
│          │                      │               │
├──────────┴──────────────────────┴───────────────┤
│ Tool Bar                                        │
├─────────────────────────────────────────────────┤
│ Validation Panel                                │
└─────────────────────────────────────────────────┘
```

左侧：Chapter / Stage / New / Copy / Delete / 修改章节关卡。

中间：Canvas / Zoom / Pan / Grid。

右侧：Spawn / End / Tower / Junction / Position 属性。

底部：绘制工具和 Validation 结果。

## 18. 本地保存

V1 使用 IndexedDB。

保存：

- EditorProject
- Levels
- 最近打开项目
- 必要编辑器状态

建议操作后自动保存，可使用 300~1000ms debounce。

JSON 导入：

```text
File Input
→ file.text()
→ JSON.parse
→ Zod
→ Deserializer
→ Editor
```

JSON 导出支持：

- 当前 Level。
- 全部 Level。

V2 再考虑 File System Access API 直接选择本地目录读写。

## 19. JSON Version

V1：

```json
{
  "version": 1
}
```

导入时首先检查 version。

未来格式变化时采用：

```text
Old Version
→ Migration
→ Current Version
```

V1 只预留结构，不必实现完整迁移系统。

## 20. 测试策略

Core 优先单元测试。

重点测试：

### GraphBuilder

- 直线
- 转弯
- 分叉
- 汇合
- 十字路
- 孤立格

### Validator

- 正常路线
- Spawn 非端点
- End 非端点
- Tower 冲突
- Junction 缺失
- Junction 权重错误
- 无法到达 End
- 有向循环

### RouteSimulator

- 单路径
- 两分支
- 多 Junction
- 多 Spawn
- 权重选择

### Serializer

- Import → Export 数据一致
- Editor Model → Runtime LevelConfig 正确

## 21. 推荐目录

```text
src/

core/
├── model/
├── graph/
├── junction/
├── validation/
├── simulation/
└── serialization/

editor/
├── command/
├── selection/
└── state/

renderer/
├── MapRenderer.ts
├── GridRenderer.ts
├── PathRenderer.ts
├── NodeRenderer.ts
├── JunctionRenderer.ts
├── SelectionRenderer.ts
├── ValidationRenderer.ts
└── SimulationRenderer.ts

persistence/
├── IndexedDBRepository.ts
├── ProjectRepository.ts
└── LevelFileService.ts

ui/
├── components/
├── views/
└── stores/

tests/
├── graph/
├── validation/
├── simulation/
└── serialization/
```

目录允许在开发中调整，不要求初始化阶段一次性全部创建。

## 22. 实施阶段

### Phase 0：项目初始化

实现 Vue 3、TypeScript、Vite、Pinia、Vitest、Zod、ESLint / Prettier。

验收：项目可运行，测试环境正常，基础目录建立。

### Phase 1：Core 数据模型

实现 GridPosition、Direction、SpawnPoint、EndPoint、TowerNode、Junction、LevelConfig。

验收：可以手动构建一个完整合法 LevelConfig。

### Phase 2：GridMap 与 GraphBuilder

实现内部 Path Set、Grid 查询、Neighbor 查询、GraphBuilder、Junction Candidate 判断。

验收：任意 PathCells 可以转换为 Graph，并识别端点、普通路径、复杂路口。

### Phase 3：Validator

实现基础规则、连通性、Tower 冲突、Junction、权重、可达性、有向循环检测。

验收：V1 定义的主要错误均可正确发现。

### Phase 4：RouteSimulator

实现普通路线移动、Junction Resolver、Weight Random、End 判断、多 Spawn。

验收：纯 TypeScript 可以输出一条完整合法路线。

### Phase 5：基础 Web UI

实现 Editor 页面布局、LevelTree、ToolBar、PropertyPanel、ValidationPanel、MapCanvas 容器。

验收：页面结构完整，Core 与 UI 解耦。

### Phase 6：Canvas 地图显示

实现 Grid、Path、Spawn、End、Tower、Junction、Selection。

验收：LevelConfig 能完整显示在 Canvas。

### Phase 7：Canvas 编辑

实现 Path、Eraser、Spawn、End、Tower、Select。

验收：可以从空地图完成一个基础关卡。

### Phase 8：Junction 编辑

实现自动识别 Junction、选中、enterFrom、exits、weight、未配置状态。

验收：可完成分叉 / 汇合 / 十字路线配置。

### Phase 9：Command / Undo / Redo

实现 Command Manager、Stroke、节点修改、Junction 修改、Ctrl+Z、Ctrl+Y / Ctrl+Shift+Z。

验收：所有主要地图操作均可以撤销和重做。

### Phase 10：Validation UI

实现 Error / Warning、点击定位、Canvas 高亮。

验收：编辑完成后能直观看到并定位配置问题。

### Phase 11：Route Preview

实现 Test Route、Simulator 接入 Canvas、路线高亮、小球运动、多 Spawn 选择。

验收：可以从指定 Spawn 模拟移动到 End。

### Phase 12：Project / Level 系统

实现 EditorProject、Chapter / Stage、New / Copy / Delete / 修改章节关卡、Level 列表。

验收：一个项目可维护多个章节和多个关卡。

### Phase 13：IndexedDB

实现 Project Repository、自动保存、自动恢复、最近项目。

验收：刷新和关闭页面后数据仍存在。

### Phase 14：Import / Export

实现 Zod Schema、JSON Import、Runtime JSON Export、当前 Level / 全部 Level 导出。

验收：导出数据可被游戏端直接读取，非法配置无法导入。

### Phase 15：Resize 与收尾

实现 Resize、裁剪确认、Undo Resize、快捷键、异常状态处理、基础交互优化。

验收：V1 全部功能完成，Core 关键测试通过，可以稳定制作实际关卡。

## 23. 开发原则

1. 先 Core，后 UI。
2. 所有游戏规则放 Core。
3. 所有文件格式通过 Serializer / Deserializer。
4. Editor 数据和 Runtime 数据分离。
5. 每个 Phase 独立验收。
6. Core 关键行为必须有测试。
7. 不在当前 Phase 顺手扩展后续功能。
8. 不让 Vue Component 承担 Graph、Validator、RouteSimulator 等业务职责。

## 24. 后续可扩展方向

V1 完成后再评估：

- File System Access API
- 本地目录 Workspace
- 多 EndPoint 复杂规则
- Spawn 与 Wave 配置关联
- Tower unlockCost
- Terrain
- Decoration
- Enemy Route Group
- 固定随机种子
- 路线统计
- 地图截图
- 快捷键配置
- 批量关卡检查
- 与 Cocos 项目自动同步
- Cocos Creator Editor Extension
- Runtime Config Migration

这些内容不进入当前 V1。

## 25. 后续与 Codex 的协作方式

每进入一个 Phase，都先单独进行一次设计拆分，再交给 Codex。

推荐流程：

```text
1. 确定当前 Phase
2. 分析现有代码
3. 明确本阶段范围
4. 设计接口和文件
5. 明确禁止修改范围
6. 定义验收标准
7. 生成 Codex 执行提示
8. Codex 实现
9. Review Diff
10. 运行测试
11. 验收
12. 进入下一 Phase
```

不要一次让 Codex 实现多个大阶段。

如一个 Phase 仍然较大，应继续拆成多个小任务和独立提交。

## 26. V1 完成标准

满足以下条件后，V1 才算完成：

- 可以新建项目。
- 可以管理 Chapter / Stage。
- 可以创建空地图。
- 可以绘制和擦除路线。
- 可以创建 Spawn。
- 可以创建 End。
- 可以创建 TowerNode。
- 可以自动识别 Junction。
- 可以配置 Junction。
- 可以检测错误路线。
- 可以检测有向循环。
- 可以模拟怪物路线。
- 可以 Undo / Redo。
- 可以 Resize。
- 可以复制和删除关卡。
- 可以自动保存。
- 可以重新打开继续编辑。
- 可以导入 JSON。
- 可以导出 Runtime JSON。
- 导出的 JSON 可以被游戏运行时读取。
- Core 关键测试通过。

达到以上标准后，再进入 V2。
