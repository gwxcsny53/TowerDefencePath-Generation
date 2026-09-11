# Tower Defense Path Editor

一个纯浏览器本地运行的 2D 塔防路线配置编辑器。用于制作、校验、预览并导出供游戏运行时读取的关卡路线数据；不包含后端、账号或云同步。

## 技术栈

- Vue 3、TypeScript、Vite、Pinia
- Canvas 2D 渲染
- Zod 运行时数据校验
- Vitest 单元测试
- IndexedDB 本地自动保存

## 核心能力

- 绘制和擦除 Path，放置 Spawn、End、Tower
- 配置 Junction 的入口、出口和权重
- Undo / Redo、地图校验与路线预览
- 项目内多关卡的新建、复制、删除与切换
- IndexedDB 本地自动保存
- Runtime Level JSON 与 Project Backup JSON 的导入导出
- 左上锚定的 Grid Resize，并在裁切数据前展示影响

## 坐标与尺寸

`(0, 0)` 位于左上角，`x` 向右增加，`y` 向下增加。调整地图尺寸始终固定左上角：增加列会向右扩展，增加行会向下扩展；缩小时从右侧和/或底部裁切，现有坐标不会平移。

## Junction

`enterFrom` 表示进入 Junction 前一个格子相对 Junction 的方向。例如 `enterFrom: "left"` 表示从 Junction 左侧进入。`exitTo` 表示离开 Junction 后下一个格子相对 Junction 的方向。

## 文件格式与本地数据

- Runtime Level 导出是纯 `LevelConfig` JSON，可直接供游戏运行时读取。
- Project Backup 使用 `*.tdpe-project.json`，包含项目及当前活动关卡地址，仅用于编辑器备份和恢复。
- 项目会自动保存到浏览器 IndexedDB；数据仅保留在当前浏览器本地，不会上传到服务端。

## 开发命令

```bash
npm install
npm run dev
npm run check
npm run build
```
