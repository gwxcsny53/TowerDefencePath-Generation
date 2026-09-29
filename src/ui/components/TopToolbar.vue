<script setup lang="ts">
import { ListChecks, MoreHorizontal, Play, Redo2, Undo2 } from 'lucide-vue-next';

import UiButton from '@/ui/components/base/UiButton.vue';
import UiIconButton from '@/ui/components/base/UiIconButton.vue';
import UiPopover from '@/ui/components/base/UiPopover.vue';

defineProps<{
  canUndo: boolean;
  canRedo: boolean;
  canTestRoute: boolean;
  testRouteTitle: string;
  persistenceStatus: 'loading' | 'saved' | 'saving' | 'error';
  persistenceError: string | null;
  currentLevelLabel?: string;
}>();
const emit = defineEmits<{
  undo: [];
  redo: [];
  validate: [];
  'test-route': [];
  import: [];
  export: [];
}>();

function runMoreAction(close: () => void, action: 'import' | 'export'): void {
  close();
  if (action === 'import') emit('import');
  else emit('export');
}
</script>

<template>
  <header class="top-toolbar tdpe-glass-g2">
    <div class="top-toolbar-identity">
      <h1 class="top-toolbar-title">TDPE</h1>
      <span v-if="currentLevelLabel" class="top-toolbar-level">{{ currentLevelLabel }}</span>
    </div>

    <nav class="top-toolbar-history" aria-label="历史操作">
      <UiIconButton label="撤销" size="compact" :disabled="!canUndo" @click="emit('undo')">
        <Undo2 :size="16" aria-hidden="true" />
      </UiIconButton>
      <UiIconButton label="重做" size="compact" :disabled="!canRedo" @click="emit('redo')">
        <Redo2 :size="16" aria-hidden="true" />
      </UiIconButton>
    </nav>

    <nav class="top-toolbar-actions" aria-label="编辑器操作">
      <span
        class="top-toolbar-persistence"
        :class="`top-toolbar-persistence--${persistenceStatus}`"
      >
        {{
          persistenceStatus === 'loading'
            ? '读取中'
            : persistenceStatus === 'saving'
              ? '保存中'
              : persistenceStatus === 'error'
                ? '保存失败'
                : '已保存'
        }}
      </span>
      <UiButton variant="secondary" @click="emit('validate')">
        <ListChecks :size="16" aria-hidden="true" />
        校验
      </UiButton>
      <UiButton variant="primary" :disabled="!canTestRoute" @click="emit('test-route')">
        <Play :size="18" aria-hidden="true" />
        测试路线
      </UiButton>
      <UiPopover>
        <template #trigger="{ open, toggle }">
          <UiIconButton
            label="更多操作"
            size="normal"
            aria-haspopup="menu"
            :aria-expanded="open"
            @click="toggle"
          >
            <MoreHorizontal :size="18" aria-hidden="true" />
          </UiIconButton>
        </template>
        <template #default="{ close }">
          <div class="top-toolbar-more-menu" role="menu" aria-label="更多操作">
            <UiButton variant="ghost" size="sm" disabled role="menuitem">项目</UiButton>
            <UiButton
              variant="ghost"
              size="sm"
              role="menuitem"
              @click="runMoreAction(close, 'import')"
            >
              导入
            </UiButton>
            <UiButton
              variant="ghost"
              size="sm"
              role="menuitem"
              @click="runMoreAction(close, 'export')"
            >
              导出
            </UiButton>
          </div>
        </template>
      </UiPopover>
    </nav>
  </header>
</template>

<style scoped>
.top-toolbar {
  position: relative;
  z-index: var(--z-floating);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: var(--space-4);
  min-width: 0;
  height: 48px;
  padding: 0 var(--space-3);
  color: var(--text-primary);
  border-radius: var(--radius-floating);
}

.top-toolbar-identity {
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
  min-width: 0;
}

.top-toolbar-title {
  margin: 0;
  overflow: hidden;
  font-size: var(--font-size-window-title);
  font-weight: var(--font-weight-semibold);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.top-toolbar-level {
  overflow: hidden;
  color: var(--text-secondary);
  font-size: var(--font-size-metadata);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.top-toolbar-history,
.top-toolbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  min-width: 0;
}

.top-toolbar-history {
  justify-self: center;
}

.top-toolbar-actions {
  justify-self: end;
  justify-content: flex-end;
}

.top-toolbar-persistence {
  margin-right: var(--space-1);
  color: var(--text-muted);
  font-size: var(--font-size-metadata);
  white-space: nowrap;
}

.top-toolbar-persistence--error {
  color: var(--status-danger);
}

.top-toolbar-more-menu {
  display: grid;
  gap: var(--space-1);
}
</style>
