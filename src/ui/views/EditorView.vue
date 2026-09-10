<script setup lang="ts">
import LevelTree from '@/ui/components/LevelTree.vue';
import MapCanvas from '@/ui/components/MapCanvas.vue';
import PropertyPanel from '@/ui/components/PropertyPanel.vue';
import ToolPalette from '@/ui/components/ToolPalette.vue';
import TopToolbar from '@/ui/components/TopToolbar.vue';
import ValidationPanel from '@/ui/components/ValidationPanel.vue';
</script>

<template>
  <section class="editor-view" aria-label="塔防关卡编辑器">
    <TopToolbar />

    <main class="editor-workspace">
      <aside class="editor-level-area" aria-label="关卡列表">
        <LevelTree />
      </aside>

      <section class="editor-map-area" aria-label="地图编辑区域">
        <MapCanvas />
      </section>

      <aside class="editor-property-area" aria-label="属性面板">
        <PropertyPanel />
      </aside>
    </main>

    <ToolPalette />
    <ValidationPanel />
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
  grid-template-columns: minmax(200px, 240px) minmax(0, 1fr) minmax(260px, 300px);
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
    grid-template-columns: minmax(160px, 200px) minmax(0, 1fr) minmax(220px, 260px);
  }
}
</style>
