<script setup lang="ts">
import { Castle, Eraser, Flag, MapPin, MousePointer2, Route } from 'lucide-vue-next';
import { EDITOR_TOOLS, getEditorToolShortcutLabel } from '@/editor';
import type { EditorTool } from '@/editor';
import UiIconButton from '@/ui/components/base/UiIconButton.vue';

defineProps<{ activeTool: EditorTool }>();
const emit = defineEmits<{ 'select-tool': [tool: EditorTool] }>();
const toolLabels: Record<EditorTool, string> = {
  select: '选择',
  path: '路线',
  spawn: '出生点',
  end: '终点',
  tower: '塔位',
  eraser: '橡皮擦',
};
const toolIcons = {
  select: MousePointer2,
  path: Route,
  spawn: MapPin,
  end: Flag,
  tower: Castle,
  eraser: Eraser,
};
</script>

<template>
  <nav class="tool-dock" aria-label="编辑工具">
    <UiIconButton
      v-for="tool in EDITOR_TOOLS"
      :key="tool"
      size="tool"
      :class="{ 'is-active': activeTool === tool }"
      :label="`${toolLabels[tool]}，快捷键 ${getEditorToolShortcutLabel(tool)}`"
      :aria-pressed="activeTool === tool"
      @click="emit('select-tool', tool)"
    >
      <component :is="toolIcons[tool]" :size="18" aria-hidden="true" />
    </UiIconButton>
  </nav>
</template>
