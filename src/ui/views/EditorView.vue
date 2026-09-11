<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import LevelTree from '@/ui/components/LevelTree.vue';
import MapCanvas from '@/ui/components/MapCanvas.vue';
import PropertyPanel from '@/ui/components/PropertyPanel.vue';
import ToolPalette from '@/ui/components/ToolPalette.vue';
import TopToolbar from '@/ui/components/TopToolbar.vue';
import ValidationPanel from '@/ui/components/ValidationPanel.vue';
import { useEditorStore } from '@/ui/stores/editorStore';

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
} = storeToRefs(editorStore);
const selectedPosition = computed(() => selection.value?.position ?? null);

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
      @undo="editorStore.undo"
      @redo="editorStore.redo"
      @validate="editorStore.runValidation"
    />

    <main class="editor-workspace">
      <aside class="editor-level-area" aria-label="关卡列表">
        <LevelTree :level="workingLevel" />
      </aside>

      <section class="editor-map-area" aria-label="地图编辑区域">
        <MapCanvas
          :level="workingLevel"
          :selected-position="selectedPosition"
          :validation-issues="currentValidationIssues"
          :validation-focus-position="focusedValidationPosition"
          @cell-pointer-down="editorStore.beginStroke"
          @cell-pointer-move="editorStore.continueStroke"
          @cell-pointer-up="editorStore.endStroke"
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

@media (max-width: 1000px) {
  .editor-workspace {
    grid-template-columns: minmax(160px, 200px) minmax(0, 1fr) minmax(280px, 320px);
  }
}
</style>
