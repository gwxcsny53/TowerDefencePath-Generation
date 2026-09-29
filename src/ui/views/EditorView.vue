<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import LevelTree from '@/ui/components/LevelTree.vue';
import ExportDialog from '@/ui/components/ExportDialog.vue';
import ImportDialog from '@/ui/components/ImportDialog.vue';
import MapCanvas from '@/ui/components/MapCanvas.vue';
import NewLevelDialog from '@/ui/components/NewLevelDialog.vue';
import PropertyPanel from '@/ui/components/PropertyPanel.vue';
import RoutePreviewOverlay from '@/ui/components/RoutePreviewOverlay.vue';
import ResizeLevelDialog from '@/ui/components/ResizeLevelDialog.vue';
import StatusBar from '@/ui/components/StatusBar.vue';
import ToolPalette from '@/ui/components/ToolPalette.vue';
import TopToolbar from '@/ui/components/TopToolbar.vue';
import ValidationPanel from '@/ui/components/ValidationPanel.vue';
import { useEditorStore } from '@/ui/stores/editorStore';
import { useRoutePreviewPlayback } from '@/ui/routePreview/useRoutePreviewPlayback';
import { getEditorToolShortcut, getNextAvailableStage } from '@/editor';
import type { GridResizeTarget, NewLevelSpec } from '@/editor';
import { downloadJsonFile, EditorImportError, parseEditorImportText } from '@/io';
import type { EditorImportPayload } from '@/io';

const editorStore = useEditorStore();
const {
  workingLevel,
  activeTool,
  selection,
  canUndo,
  canRedo,
  validationStatus,
  currentValidationIssues,
  focusedValidationIssue,
  focusedValidationPosition,
  routePreviewRun,
  canTestRoute,
  routePreviewDisabledReason,
  project,
  activeLevelAddress,
  persistenceStatus,
  persistenceError,
} = storeToRefs(editorStore);
const isNewLevelDialogOpen = ref(false);
const isImportDialogOpen = ref(false);
const isExportDialogOpen = ref(false);
const isResizeDialogOpen = ref(false);
const isDeleteLevelDialogOpen = ref(false);
const isLevelOverlayOpen = ref(false);
const isInspectorOverlayOpen = ref(false);
const isValidationDrawerOpen = ref(false);
const isAnyEditorDialogOpen = computed(
  () =>
    isNewLevelDialogOpen.value ||
    isResizeDialogOpen.value ||
    isImportDialogOpen.value ||
    isExportDialogOpen.value ||
    isDeleteLevelDialogOpen.value,
);
watch(isAnyEditorDialogOpen, (open) => {
  if (open) isValidationDrawerOpen.value = false;
});
const importInput = ref<HTMLInputElement | null>(null);
const pendingImport = ref<EditorImportPayload | null>(null);
const importError = ref<string | null>(null);
const selectedPosition = computed(() => selection.value?.position ?? null);
const currentLevelLabel = computed(
  () => `Chapter ${activeLevelAddress.value.chapter} / Stage ${activeLevelAddress.value.stage}`,
);
const validationErrorCount = computed(
  () => currentValidationIssues.value.filter((issue) => issue.severity === 'error').length,
);
const validationWarningCount = computed(
  () => currentValidationIssues.value.filter((issue) => issue.severity === 'warning').length,
);
const routePreviewPlaybackSource = computed(() => {
  const run = routePreviewRun.value;
  if (run === null) return null;
  return {
    result: run.result,
    stepDurationMs: run.moveSecondsPerCell * 1000,
  };
});
const {
  frame: routePreviewFrame,
  playbackStatus,
  stop: stopRoutePreview,
} = useRoutePreviewPlayback(routePreviewPlaybackSource);
const routePreviewRenderState = computed(() => {
  if (routePreviewRun.value === null || routePreviewFrame.value === null) return null;
  return {
    path: routePreviewRun.value.result.path,
    ...routePreviewFrame.value,
  };
});
function closeRoutePreview(): void {
  stopRoutePreview();
  editorStore.closeRoutePreview();
}
function toggleLevelOverlay(): void {
  isLevelOverlayOpen.value = !isLevelOverlayOpen.value;
  if (isLevelOverlayOpen.value) isInspectorOverlayOpen.value = false;
}
function toggleInspectorOverlay(): void {
  isInspectorOverlayOpen.value = !isInspectorOverlayOpen.value;
  if (isInspectorOverlayOpen.value) isLevelOverlayOpen.value = false;
}
function closeLevelOverlay(): void {
  isLevelOverlayOpen.value = false;
}
function closeInspectorOverlay(): void {
  isInspectorOverlayOpen.value = false;
}
const newLevelDefaults = computed<NewLevelSpec>(() => ({
  chapter: activeLevelAddress.value.chapter,
  stage: getNextAvailableStage(project.value, activeLevelAddress.value.chapter),
  cols: workingLevel.value.grid.cols,
  rows: workingLevel.value.grid.rows,
}));
function createLevel(spec: NewLevelSpec): void {
  editorStore.createLevel(spec);
  isNewLevelDialogOpen.value = false;
}
function resizeCurrentLevel(target: GridResizeTarget): void {
  if (editorStore.resizeCurrentLevel(target)) isResizeDialogOpen.value = false;
}
function openImportPicker(): void {
  if (importInput.value === null) return;
  importInput.value.value = '';
  importInput.value.click();
}
async function handleImportFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (file === undefined) return;
  try {
    pendingImport.value = parseEditorImportText(await file.text());
    importError.value = null;
  } catch (error) {
    pendingImport.value = null;
    importError.value = getImportErrorMessage(error);
  }
  isImportDialogOpen.value = true;
}
function closeImportDialog(): void {
  isImportDialogOpen.value = false;
  pendingImport.value = null;
  importError.value = null;
}
function importLevel(): void {
  if (pendingImport.value?.kind !== 'level') return;
  if (editorStore.addImportedLevel(pendingImport.value.level)) closeImportDialog();
}
function replaceImportedLevel(): void {
  if (pendingImport.value?.kind !== 'level') return;
  if (editorStore.replaceImportedLevel(pendingImport.value.level)) closeImportDialog();
}
function copyImportedLevel(): void {
  if (pendingImport.value?.kind !== 'level') return;
  if (editorStore.addImportedLevelAsCopy(pendingImport.value.level)) closeImportDialog();
}
function replaceProjectFromBackup(): void {
  if (pendingImport.value?.kind !== 'project-backup') return;
  editorStore.replaceProjectFromBackup(pendingImport.value.backup);
  closeImportDialog();
}
function exportGameStageConfig(): void {
  const file = editorStore.createGameStageExport();
  downloadJsonFile(file.filename, file.content);
  isExportDialogOpen.value = false;
}
function exportProjectBackup(): void {
  const file = editorStore.createProjectBackupExport();
  downloadJsonFile(file.filename, file.content);
  isExportDialogOpen.value = false;
}
function getImportErrorMessage(error: unknown): string {
  if (error instanceof EditorImportError) return error.message;
  return 'JSON 文件格式无效。';
}

function isEditableTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.matches('input, textarea, select') || target.isContentEditable)
  );
}

function handleKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Escape' && isValidationDrawerOpen.value && !isAnyEditorDialogOpen.value) {
    isValidationDrawerOpen.value = false;
    return;
  }
  if (isEditableTarget(event.target)) return;
  if (
    !isAnyEditorDialogOpen.value &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !event.shiftKey
  ) {
    const tool = getEditorToolShortcut(event.key);
    if (tool !== null) editorStore.setActiveTool(tool);
    return;
  }
  if (!event.ctrlKey && !event.metaKey) return;
  const key = event.key.toLowerCase();
  if (key === 'z') {
    event.preventDefault();
    if (event.shiftKey) editorStore.redo();
    else editorStore.undo();
  } else if (key === 'y') {
    event.preventDefault();
    editorStore.redo();
  }
}

onMounted(() => window.addEventListener('keydown', handleKeyDown));
onBeforeUnmount(() => window.removeEventListener('keydown', handleKeyDown));
</script>

<template>
  <section class="editor-view" aria-label="塔防关卡编辑器">
    <TopToolbar
      :can-undo="canUndo"
      :can-redo="canRedo"
      :can-test-route="canTestRoute"
      :test-route-title="routePreviewDisabledReason"
      :persistence-status="persistenceStatus"
      :persistence-error="persistenceError"
      :current-level-label="currentLevelLabel"
      @undo="editorStore.undo"
      @redo="editorStore.redo"
      @validate="editorStore.runValidation"
      @test-route="editorStore.startRoutePreview"
      @import="openImportPicker"
      @export="isExportDialogOpen = true"
    />

    <main class="editor-workspace">
      <aside
        class="editor-level-area editor-panel-frame"
        :class="{ 'is-overlay-open': isLevelOverlayOpen }"
        aria-label="关卡列表"
      >
        <header class="editor-overlay-chrome">
          <span class="editor-overlay-chrome-title">关卡</span>
          <button
            class="editor-overlay-close"
            type="button"
            aria-label="关闭关卡面板"
            @click="closeLevelOverlay"
          >
            ×
          </button>
        </header>
        <div class="editor-overlay-content">
          <LevelTree
            :project="project"
            :active-level-address="activeLevelAddress"
            @select-level="editorStore.openLevel"
            @create-level="isNewLevelDialogOpen = true"
            @duplicate-current="editorStore.duplicateCurrentLevel"
            @resize-current="isResizeDialogOpen = true"
            @delete-current="editorStore.deleteCurrentLevel"
            @delete-dialog-open-change="isDeleteLevelDialogOpen = $event"
          />
        </div>
      </aside>

      <section class="editor-canvas-stage" aria-label="地图编辑区域">
        <MapCanvas
          :level="workingLevel"
          :selected-position="selectedPosition"
          :validation-issues="currentValidationIssues"
          :validation-focus-position="focusedValidationPosition"
          :route-preview="routePreviewRenderState"
          @cell-pointer-down="editorStore.beginStroke"
          @cell-pointer-move="editorStore.continueStroke"
          @cell-pointer-up="editorStore.endStroke"
        />
        <div class="editor-floating-ui-layer">
          <ToolPalette
            :class="{ 'tool-dock--drawer-open': isValidationDrawerOpen }"
            :active-tool="activeTool"
            @select-tool="editorStore.setActiveTool"
          />
          <div class="editor-overlay-toggle-bar" aria-label="编辑器面板">
            <button
              v-if="!isLevelOverlayOpen"
              class="editor-overlay-toggle--level"
              type="button"
              @click="toggleLevelOverlay"
            >
              关卡
            </button>
            <button
              v-if="!isInspectorOverlayOpen"
              class="editor-overlay-toggle--inspector"
              type="button"
              @click="toggleInspectorOverlay"
            >
              属性
            </button>
          </div>
          <RoutePreviewOverlay
            v-if="routePreviewRun !== null && routePreviewFrame !== null"
            :result="routePreviewRun.result"
            :frame="routePreviewFrame"
            :playback-status="playbackStatus"
            :move-seconds-per-cell="routePreviewRun.moveSecondsPerCell"
            @stop="stopRoutePreview"
            @replay="editorStore.startRoutePreview"
            @close="closeRoutePreview"
          />
        </div>
        <div class="editor-drawer-layer">
          <ValidationPanel
            v-show="isValidationDrawerOpen"
            :status="validationStatus"
            :issues="currentValidationIssues"
            :focused-issue="focusedValidationIssue"
            @focus-issue="editorStore.focusValidationIssue"
            @close="isValidationDrawerOpen = false"
          />
        </div>
      </section>

      <aside
        class="editor-property-area editor-panel-frame"
        :class="{ 'is-overlay-open': isInspectorOverlayOpen }"
        aria-label="属性面板"
      >
        <header class="editor-overlay-chrome">
          <span class="editor-overlay-chrome-title">属性</span>
          <button
            class="editor-overlay-close"
            type="button"
            aria-label="关闭属性面板"
            @click="closeInspectorOverlay"
          >
            ×
          </button>
        </header>
        <div class="editor-overlay-content">
          <PropertyPanel
            :level="workingLevel"
            :selection="selection"
            @update-tower-locked="editorStore.setSelectedTowerLocked"
            @update-spawn-move-seconds-per-cell="editorStore.setSelectedSpawnMoveSecondsPerCell"
            @create-junction-config="editorStore.createSelectedJunctionConfig"
            @remove-junction-config="editorStore.removeSelectedJunctionConfig"
            @junction-entry-enabled="editorStore.setSelectedJunctionEntryEnabled"
            @junction-exit-enabled="editorStore.setSelectedJunctionExitEnabled"
            @junction-exit-weight="editorStore.setSelectedJunctionExitWeight"
          />
        </div>
      </aside>
    </main>

    <StatusBar
      :active-tool="activeTool"
      :cols="workingLevel.grid.cols"
      :rows="workingLevel.grid.rows"
      :persistence-status="persistenceStatus"
      :validation-status="validationStatus"
      :error-count="validationErrorCount"
      :warning-count="validationWarningCount"
      :validation-open="isValidationDrawerOpen"
      @toggle-validation="isValidationDrawerOpen = !isValidationDrawerOpen"
    />
    <input
      ref="importInput"
      class="editor-import-input"
      type="file"
      accept=".json,application/json"
      @change="handleImportFile"
    />
    <div class="editor-modal-layer">
      <NewLevelDialog
        :open="isNewLevelDialogOpen"
        :project="project"
        :defaults="newLevelDefaults"
        @create="createLevel"
        @cancel="isNewLevelDialogOpen = false"
      />
      <ResizeLevelDialog
        :open="isResizeDialogOpen"
        :level="workingLevel"
        @resize="resizeCurrentLevel"
        @cancel="isResizeDialogOpen = false"
      />
      <ImportDialog
        :open="isImportDialogOpen"
        :project="project"
        :payload="pendingImport"
        :error-message="importError"
        @close="closeImportDialog"
        @import-level="importLevel"
        @replace-level="replaceImportedLevel"
        @copy-level="copyImportedLevel"
        @replace-project="replaceProjectFromBackup"
      />
      <ExportDialog
        :open="isExportDialogOpen"
        @close="isExportDialogOpen = false"
        @export-game-config="exportGameStageConfig"
        @export-project="exportProjectBackup"
      />
    </div>
  </section>
</template>
