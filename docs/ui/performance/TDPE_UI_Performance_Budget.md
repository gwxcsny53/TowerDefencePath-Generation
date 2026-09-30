# TDPE UI Performance Budget / M7 Final Acceptance

> 项目：Tower Defense Path Editor
>
> 基线：`208762cfcd8f383c514f1e15e1c45211745a2cf3`（`main`）
>
> 日期：2026-09-30
>
> 本轮：Static Readiness + Performance Budget + Final Acceptance Preparation
>
> 浏览器验证 / Performance Trace：NOT PERFORMED BY DESIGN
>
> Browser Performance Validation / Final Manual Acceptance：PENDING
>
> M7 / UI Migration v1：NOT CLOSED

## 1. Purpose

本文件冻结最终材质、规定性能预算，并准备后续人工验收步骤及证据模板。本轮只审计源代码、执行静态质量门禁和核对构建资产；不启动浏览器、不截图、不录屏、不测 FPS、不做 Performance/GPU trace，也不安装浏览器测试工具。

Static architecture satisfies planned budget shape. Runtime performance remains unverified. 静态检查、两个消费者数量或历史视觉验收均不能替代 M7C 压力性能与最终回归证据。

## 2. Frozen Final Architecture

用户已人工确认 M7A、Responsive Fix、M7B-1、M7B-2 Visual Revision CLOSED，M7B CLOSED。该结果来自用户，本轮不复测。Preview displacement prototype 技术成立，但视觉 A/B 更偏好安静的 Dense Blur，已主动撤回；历史实验不属于当前运行架构。

最终冻结：Lens scale 3、Dock scale 1、Preview Dense Glass、G0/G1/G2/G3 层级、ToolDock responsive / Drawer geometry 和 Reduced Motion 行为。M7C 不增加效果、组件、布局、Hover、Motion 或消费者；发现明确冻结设计缺陷时停止并另立 Fix，不在文档任务中修改生产代码。

白名单代表允许评估，不代表必须启用。不创建 M7B-3，不自动扩展 Primary Action / Toggle / Slider，也不开始 M8。

## 3. Optical Consumer Inventory

| Consumer          | Material | Real SVG displacement | Strength | Dynamic                                                    |
| ----------------- | -------- | --------------------- | -------- | ---------------------------------------------------------- |
| Active Tool Lens  | G3       | YES                   | scale 3  | 既有 parent translate / inner scaleX stretch；滤镜参数静态 |
| ToolDock          | G2       | YES                   | scale 1  | 静态光学层；既有 parent transform                          |
| Route Preview     | G2 Dense | NO                    | 0        | Panel enter/leave；播放内容按原逻辑更新                    |
| Validation Drawer | G1       | NO                    | 0        | Drawer transition                                          |
| Inspector         | G1       | NO                    | 0        | Panel/overlay transition                                   |
| LevelPanel        | G1       | NO                    | 0        | Panel/overlay transition                                   |
| Canvas            | G0       | NO                    | 0        | Renderer only                                              |

当前真实消费者为 **2 / 2**。这里统计实际 URL backdrop 声明的两个消费者，不把 prefixed/unprefixed 声明、语法 gate 或普通 blur 重复计数。

Preview 最终材质为原 G2 Dense blur + saturation + border + floating shadow + 普通 box-shadow 的静态 inset specular（0.04 / 0.01）；没有 optical pseudo layer 或独立滤镜。

## 4. Hard Budgets

| 项目                                     | 冻结预算                                                               |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| Real SVG backdrop displacement consumers | MAX = 2；未来第三个必须重新经设计和性能审批                            |
| SVG asset                                | 一个独立 hashed liquid-refraction SVG；仅两个 filter ID                |
| Filter IDs                               | `tool-lens-refraction` / `tool-dock-refraction`                        |
| 每个 filter                              | 1 × feTurbulence + 1 × feDisplacementMap                               |
| Noise                                    | fractalNoise；baseFrequency 0.018 0.022；numOctaves 1；seed 7          |
| Displacement                             | SourceGraphic；R/G 通道；Lens scale 3 / Dock scale 1                   |
| Region                                   | x/y -20%；width/height 140%；objectBoundingBox / userSpaceOnUse / sRGB |
| Optical dynamics                         | 无参数动画、动态 seed、鼠标追踪或逐帧光学更新                          |
| Full/Fallback 布局差异                   | ≤1 CSS px；理想 0px；功能、焦点顺序和点击区域一致                      |

真实 displacement 禁止用于 Canvas、Inspector / LevelPanel background、Validation Drawer / issue list、Dialog body、全屏 overlay、大型滚动容器、普通 Input、Tooltip 和未重新授权的其他控件。Preview 不重新加入真实折射。

成本风险来自背景采样、SVG primitive、Dock 较大覆盖面积，以及背景更新与 Lens/Panel transform 期间的 Paint / Composite；只有后续浏览器证据才能确定实际成本。

## 5. Motion Budget

仅保留 M6 的 Lens parent translate、inner scaleX stretch、Dock parent transform，以及既有 Drawer / Preview / Dialog / Popover motion。不得动画 filter、turbulence、displacement scale 或把 playback progress/time 接到光学参数。

现有 requestAnimationFrame 用于 Indicator geometry measurement 和 Route Preview playback，不是 RAF-driven optics；Canvas pointermove 属于编辑操作，不是鼠标光学追踪。不能以这些合法调用的存在误判光学动画，也不能宣称整个项目没有 RAF。

## 6. Full / Fallback Contract

两个独立 CSS `@supports` gate 分别检测 URL backdrop-filter 语法。无 JS capability bridge、UA/browser-name、OS/GPU 分支。语法支持不证明 SVG 加载或真实 displacement 被执行；Full 的实际能力仍需人工视觉确认。

Lens G3 和 Dock G2 基底始终存在。统一 hook 同时移除 Lens / Dock 的 `::before` displacement 和 `::after` specular，支持祖先以及相应消费者自身属性。SVG 忽略/失败时基底仍保留，但 gate 内高光可能保留；严格 A/B 使用 hook。

后续人工 DevTools 命令（本轮 Codex 不执行）：

```js
document.body.setAttribute('data-visual-refraction', 'off');
```

恢复自动 gate：

```js
document.body.removeAttribute('data-visual-refraction');
```

执行前记录 html/body/root/消费者上的既有 hook；比较结束后恢复原状态。不得把 hook 接入 Store、设置 UI 或持久化。

Route Preview is NOT a Full/Fallback optical consumer. 开关前后其 Dense Blur 与静态高光应基本一致；不得改变 ToolDock/button width、Lens target geometry、Canvas layout、focus order、pointer target 或业务功能。

## 7. Reduced Motion Contract

`motion.css` 在 prefers-reduced-motion: reduce 下将 --motion-fast、--motion-normal、--motion-panel、--motion-liquid、--motion-modal、--motion-exit 设为 0ms；`editor-workflow.css` 对 Tool Lens is-stretching 设置 animation: none。

后续通过 OS 设置或 DevTools Rendering 模拟 prefers-reduced-motion，再分别测 Full 与 Fallback。目标是无 overshoot、无 stretch、无 Panel tween duration，功能完整，静态材质可读。静态 Lens / Dock 折射可以保留；Reduced Motion 不等于关闭所有 Glass / Refraction。本轮不操作模拟设置。

## 8. Stress Scenarios

使用相同项目数据、路径长度、Junction 配置、设备、窗口、DPR 和操作顺序进行 Full / Fallback 对比。先准备复杂且有效的 Junction / Inspector 长内容，验证数据新鲜且 Preview 门禁允许播放；Drawer 可展示通过态或不阻断播放的提示。不要为满足组合截图而绕过校验门禁。编辑导致 stale 后按现有流程重新校验，再启动播放。

### 1440×900 主压力场景

1. 选择复杂 Junction，保持 Inspector 长内容可见。
2. 打开 Validation Drawer，并启动 Route Preview。
3. 快速切换 1→6→2→5→3→1，检查最终工具和 Lens 位置。
4. 悬停 ToolDock 触发 Tooltip，并用键盘检查工具焦点。
5. 停止 / 重播 Preview，再关闭并重新打开 Drawer。
6. 滚动 Inspector 长内容，检查 Number Input、Validation issue 定位和 Canvas 编辑响应；数据变更后按门禁重新校验。
7. 检查 time/progress/status 更新与 stop/replay/close 的即时响应。

### 1000×900 响应压力场景

分别检查 Level Overlay、Inspector Overlay、Overlay 切换、各自与 Drawer 的组合，以及 Preview 可用状态。检查 Dock X +140px / -140px 与 Drawer Y shift、工具切换、圆角裁切、Tooltip、pointer / keyboard；不以此任务扩大响应设计范围。

## 9. Performance Metrics

| 指标                   | 后续人工目标 / 判定                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Main-thread Long Tasks | 交互动画期间无重复、持续、可感知阻塞的 >50ms long task，尤其是可归因于 M7 optics 的任务                          |
| 交互响应               | Tool 1–6、Canvas 编辑、Inspector Number Input、Validation issue、Preview stop/replay/close、Overlay 开关即时响应 |
| Preview playback       | Full 不应出现相对 Fallback 的明显播放降帧或更新阻塞                                                              |
| Layout                 | Full/Fallback 尺寸差异 ≤1 CSS px，功能/焦点/点击区域一致                                                         |
| Paint / Composite      | 记录 Main Thread、Long Tasks、Rendering、Paint、Composite Layers 的变化和对应操作，避免持续高成本重绘            |
| Console                | 无 SVG/filter 加载、CSS filter 相关或 Vue runtime 错误；无新增相关 warning                                       |

单个偶发 >50ms 任务不自动判失败；记录时间、触发操作、可感知影响并复现，对比同设备 Fallback，判断是否重复且与 optics 相关。无既有实测基线时，不虚构 GPU memory 上限、所有机器 FPS ≥60 或固定 Paint 毫秒阈值；不能只凭平均 FPS 判定。

已知 favicon 等无关资源问题单独记录，不误归因于折射。Console 错误未记录和解释前，不宣布对应项通过。

## 10. Browser / Viewports Matrix

最低后续人工环境为 Chrome / Chromium primary；记录实际浏览器版本、OS、GPU 和 DPR。Safari / Firefox 如需覆盖另行扩展，本轮不声称已验证。

每个 1440×900 与 1000×900 至少覆盖 Full、Forced Fallback、Reduced Motion Full、Reduced Motion + Fallback。高 DPR 环境检查 Lens/Dock 圆角、1px border、specular edge、Canvas grid 与文字，无毛刺、半像素异常、矩形滤镜边或文字变糊。

| 场景                   | Full    | Fallback | Reduced Motion      | Final   |
| ---------------------- | ------- | -------- | ------------------- | ------- |
| Tool switching         | PENDING | PENDING  | PENDING             | PENDING |
| ToolDock tooltip       | PENDING | PENDING  | PENDING             | PENDING |
| Validation Drawer      | PENDING | PENDING  | PENDING             | PENDING |
| Complex Junction       | PENDING | PENDING  | PENDING             | PENDING |
| Route Preview playback | PENDING | PENDING  | PENDING             | PENDING |
| Responsive overlays    | PENDING | PENDING  | PENDING             | PENDING |
| 1440×900               | PENDING | PENDING  | PENDING             | PENDING |
| 1000×900               | PENDING | PENDING  | PENDING             | PENDING |
| High DPI               | PENDING | PENDING  | PENDING             | PENDING |
| Console                | PENDING | PENDING  | PENDING             | PENDING |
| Performance trace      | PENDING | PENDING  | PENDING（optional） | PENDING |

Reduced Motion 列必须分别记录 Full 和 Fallback 的结果。所有运行时项本轮保持 PENDING，历史 M7A/M7B 结果不回填此矩阵。

## 11. Manual Acceptance Procedure

以下全部为后续用户人工步骤，本轮不执行：

| 顺序 | 步骤与检查                                                                                                                |
| ---- | ------------------------------------------------------------------------------------------------------------------------- |
| A    | 1440×900 Full baseline：Lens 真实折射可见且强于 Dock；Dock 弱折射；无矩形 bleed、图标扭曲、Tooltip 裁切、SVG/filter error |
| B    | 1440×900 Full stress：按第 8 节固定顺序执行主压力流程                                                                     |
| C    | 1440×900 Fallback stress：设置统一 off，重复相同数据和流程；Lens 仍为 G3、Dock 仍为 G2；Preview、布局、焦点和功能不变     |
| D    | Reduced Motion Full：恢复自动 gate，启用 reduced-motion，重复流程，无 stretch / overshoot / Panel tween                   |
| E    | Reduced Motion Fallback：保留 reduced-motion，启用 off，重复相同流程                                                      |
| F    | 1000×900 responsive stress：按最低四种模式检查两侧 Overlay 与 Drawer 组合及 pointer                                       |
| G    | High DPI edge check：记录实际 DPR，检查边缘、Canvas 和文字                                                                |
| H    | Performance trace Full：恢复正常 Motion / 自动 gate，同设备同数据录制主压力流程，保存原始 trace 与操作时间标记            |
| I    | Performance trace Fallback：仅切换统一 off，重复相同录制流程，比较响应、长任务、Layout、Paint/Composite 和播放            |
| J    | Console review：汇总每种模式的错误/警告及归因，恢复 hook 和模拟设置原状态                                                 |

录制前确保项目已加载、资源稳定，保持设备负载和 DevTools 录制设置一致，记录是否启用 CPU throttling。使用相同观察区间；发现重复长任务时按相同触发流程复现，记录实际录制时长，不虚构已测数据。

## 12. Evidence Template / Index

复制以下模板填写每个运行；未采集字段本轮为空：

```text
Commit:
Browser:
Version:
OS:
GPU:
Viewport:
DPR:
Mode: Full / Fallback / Reduced Motion Full / Reduced Motion Fallback
Scene / project data:
CPU throttling / recording settings:
Recording duration:
Long Tasks: timestamps / triggers / duration / repeatability / attribution
Layout: Full/Fallback dimensions and delta
Paint:
Composite:
Interaction notes:
Preview playback:
Console:
Evidence paths:
Result: PENDING / PASS / FAIL
Reviewer / date:
```

| 最终截图索引                           | 状态    |
| -------------------------------------- | ------- |
| M7C-01-full-1440                       | PENDING |
| M7C-02-fallback-1440                   | PENDING |
| M7C-03-reduced-motion                  | PENDING |
| M7C-04-complex-junction-drawer-preview | PENDING |
| M7C-05-responsive-level-overlay        | PENDING |
| M7C-06-responsive-inspector-overlay    | PENDING |
| M7C-07-high-dpi                        | PENDING |

| Performance Trace 索引      | 状态    |
| --------------------------- | ------- |
| M7C-PERF-01-full-stress     | PENDING |
| M7C-PERF-02-fallback-stress | PENDING |

截图记录 viewport、mode、DPR、commit、场景。截图不证明响应性能；保留原始 trace、操作说明与比较结论。本轮没有生成截图、trace 或运行时数值。

## 13. Pass / Fail Criteria

关闭 M7 必须全部满足：静态质量门禁 PASS、最终白名单符合设计、Full/Fallback 功能 PASS、Reduced Motion PASS、Responsive PASS、High DPI PASS、Console PASS、Performance trace PASS；无可归因于 M7 optics 的持续 >50ms 长任务，Preview 播放无明显降级。后续用户确认并追加证据后才可写 M7C PASS / M7 CLOSED / TDPE UI Migration v1 CLOSED。

以下任一可复现问题使对应 M7C 项 FAIL、M7 NOT CLOSED：Lens/Dock 明显输入延迟，光学交互引发持续 >50ms 长任务，Full 布局偏移 >1px，Fallback 改变焦点/pointer/功能，矩形裁切或 Tooltip 回归，Reduced Motion 仍 stretch/overshoot，Preview 只在 Full 下明显降级，Console 出现相关 SVG/filter 错误。

静态审计如发现第三个 consumer、Preview 残留 displacement、禁止区域使用 displacement、未记录滤镜变化、质量门禁或 build 失败、测试数下降，应停止并报告，不修改生产代码。

## 14. Rollback Order

未来人工性能不通过时另行授权独立 Fix：优先移除 ToolDock 真实折射、保留 Tool Lens。Lens 面积最小、交互意义最强；Dock 面积更大且收益次于 Lens，因此先回退 Dock。若仍有问题继续依据证据评估，不牺牲文本可读性、Canvas 清晰度、可访问性或业务逻辑。

统一 off 可用于诊断，但关闭 Lens + Dock 不能直接证明哪个消费者导致问题。没有性能证据前，本轮不关闭 Dock、不降低 Canvas quality、不删除 accessibility，也不执行回滚。

## 15. Static Audit / Current Status

源代码审计方法：对 `src` 精确搜索 refraction、backdrop-filter URL、SVG filter primitives、动态调度和 capability 标识，跟随命中的 Indicator measurement 与 Preview playback 实现；未读取无关候选或进行浏览器检验。

| 静态项目                          | 当前源代码证据                                                                                                                         |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| SVG filter IDs                    | 2：tool-lens-refraction / tool-dock-refraction；scale 3 / 1，固定 seed 7，单 octave                                                    |
| URL backdrop consumer selectors   | 2：`.ui-liquid-indicator--tool .ui-liquid-indicator__surface::before` / `.tool-dock::before`；两种属性合计 4 条实际声明，两个语法 gate |
| Forbidden surfaces                | Canvas / Inspector / Validation 的真实 displacement 为 0；无第三个 consumer                                                            |
| Preview                           | fragment 0、光学伪元素 0、fallback selector 0；Dense Glass 和静态 inset shadow 存在                                                    |
| Optical dynamics                  | 无 SVG animate/script、参数动画、mouse tracking、RAF-driven filter update；既有测量/播放 RAF 与 Canvas pointermove 不驱动 optics       |
| Capability                        | 仅 CSS @supports；未发现 UA / browser / OS / GPU 或 JS capability 分支                                                                 |
| Fallback                          | 祖先及自身 hook 覆盖 Lens/Dock before + after；Preview 不受影响                                                                        |
| Reduced Motion                    | 六个 motion tokens 0ms；Lens stretch animation none；静态 optics 保留                                                                  |
| Accessibility / production freeze | 本轮不改 src；aria、button semantics、focus/tab order、pointer-events 架构保持                                                         |

静态质量与 production asset 检查：PASS。typecheck、lint、format:check、test:run、build 与 git diff --check 全部通过；29 test files / 174 tests 未减少。生产构建输出独立 `liquid-refraction-EJ0jxXGL.svg`，内容与源 SVG 一致，仅 Lens / Dock 两个 filter；两种 backdrop 属性合计四条构建 URL 保留两个 fragment，无 Preview fragment、Data URI 或残留 ?no-inline。源代码审计确认真实 URL consumer selectors = 2；git diff -- src 与 package 文件均为空，仅两份文档变更，UTF-8 无 BOM / LF。运行时性能、浏览器最终回归、布局实测和辅助技术检查均未执行。

```text
M7C Static Readiness: DONE
Performance Budget: DONE
Final Acceptance Procedure: DONE
Browser Performance Validation: PENDING
Final Manual Acceptance: PENDING
M7 milestone: NOT CLOSED
UI Migration v1: NOT CLOSED
```
