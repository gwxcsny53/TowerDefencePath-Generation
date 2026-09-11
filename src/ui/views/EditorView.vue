<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import LevelTree from '@/ui/components/LevelTree.vue';
import ExportDialog from '@/ui/components/ExportDialog.vue';
import ImportDialog from '@/ui/components/ImportDialog.vue';
import MapCanvas from '@/ui/components/MapCanvas.vue';
import NewLevelDialog from '@/ui/components/NewLevelDialog.vue';
import PropertyPanel from '@/ui/components/PropertyPanel.vue';
import RoutePreviewOverlay from '@/ui/components/RoutePreviewOverlay.vue';
import ResizeLevelDialog from '@/ui/components/ResizeLevelDialog.vue';
import ToolPalette from '@/ui/components/ToolPalette.vue';
import TopToolbar from '@/ui/components/TopToolbar.vue';
import ValidationPanel from '@/ui/components/ValidationPanel.vue';
import { useEditorStore } from '@/ui/stores/editorStore';
import { useRoutePreviewPlayback } from '@/ui/routePreview/useRoutePreviewPlayback';
import { getNextAvailableStage } from '@/editor';
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
const importInput = ref<HTMLInputElement | null>(null);
const pendingImport = ref<EditorImportPayload | null>(null);
const importError = ref<string | null>(null);
const selectedPosition = computed(() => selection.value?.position ?? null);
const routePreviewResult = computed(() => routePreviewRun.value?.result ?? null);
const {
  frame: routePreviewFrame,
  playbackStatus,
  stop: stopRoutePreview,
} = useRoutePreviewPlayback(routePreviewResult);
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
function exportCurrentLevel(): void {
  const file = editorStore.createCurrentLevelExport();
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
  if ((!event.ctrlKey && !event.metaKey) || isEditableTarget(event.target)) return;
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
      @undo="editorStore.undo"
      @redo="editorStore.redo"
      @validate="editorStore.runValidation"
      @test-route="editorStore.startRoutePreview"
      @import="openImportPicker"
      @export="isExportDialogOpen = true"
    />

    <main class="editor-workspace">
      <aside class="editor-level-area" aria-label="关卡列表">
        <LevelTree
          :project="project"
          :active-level-address="activeLevelAddress"
          @select-level="editorStore.openLevel"
          @create-level="isNewLevelDialogOpen = true"
          @duplicate-current="editorStore.duplicateCurrentLevel"
          @resize-current="isResizeDialogOpen = true"
          @delete-current="editorStore.deleteCurrentLevel"
        />
      </aside>

      <section class="editor-map-area" aria-label="地图编辑区域">
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
        <RoutePreviewOverlay
          v-if="routePreviewRun !== null && routePreviewFrame !== null"
          :result="routePreviewRun.result"
          :frame="routePreviewFrame"
          :playback-status="playbackStatus"
          @stop="stopRoutePreview"
          @replay="editorStore.startRoutePreview"
          @close="closeRoutePreview"
        />
      </section>

      <aside class="editor-property-area" aria-label="属性面板">
        <PropertyPanel
          :level="workingLevel"
          :selection="selection"
          @update-tower-locked="editorStore.setSelectedTowerLocked"
          @create-junction-config="editorStore.createSelectedJunctionConfig"
          @remove-junction-config="editorStore.removeSelectedJunctionConfig"
          @junction-entry-enabled="editorStore.setSelectedJunctionEntryEnabled"
          @junction-exit-enabled="editorStore.setSelectedJunctionExitEnabled"
          @junction-exit-weight="editorStore.setSelectedJunctionExitWeight"
        />
      </aside>
    </main>

    <ToolPalette :active-tool="activeTool" @select-tool="editorStore.setActiveTool" />
    <ValidationPanel
      :status="validationStatus"
      :issues="currentValidationIssues"
      :focused-issue="focusedValidationIssue"
      @focus-issue="editorStore.focusValidationIssue"
    />
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
    <input
      ref="importInput"
      class="editor-import-input"
      type="file"
      accept=".json,application/json"
      @change="handleImportFile"
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
      @export-level="exportCurrentLevel"
      @export-project="exportProjectBackup"
    />
  </section>
</template>

<style>
.editor-view {
  display: grid;
  grid-template-rows: 52px minmax(0, 1fr) 48px 160px;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--color-app-background);
}

.editor-workspace {
  display: grid;
  grid-template-columns: minmax(200px, 240px) minmax(0, 1fr) minmax(340px, 380px);
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.editor-level-area,
.editor-property-area {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: var(--color-panel-background);
}

.editor-level-area {
  border-right: 1px solid var(--color-panel-border);
}

.editor-map-area {
  position: relative;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.editor-property-area {
  border-left: 1px solid var(--color-panel-border);
}

.panel {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  width: 100%;
  height: 100%;
  min-height: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid var(--color-panel-border);
}

.panel-title {
  margin: 0;
  color: #334155;
  font-size: 0.875rem;
  font-weight: 650;
}

.panel-content {
  min-height: 0;
  overflow: auto;
}

.empty-state {
  display: grid;
  min-height: 100%;
  place-content: center;
  gap: 0.375rem;
  padding: 1rem;
  color: var(--color-panel-muted);
  text-align: center;
}

.empty-state p {
  margin: 0;
}

.empty-state p:first-child {
  color: #475569;
  font-weight: 600;
}

.editor-import-input {
  display: none;
}

@media (max-width: 1000px) {
  .editor-workspace {
    grid-template-columns: minmax(160px, 200px) minmax(0, 1fr) minmax(280px, 320px);
  }
}
</style>
