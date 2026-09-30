<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Castle, Eraser, Flag, MapPin, MousePointer2, Route } from 'lucide-vue-next';
import { EDITOR_TOOLS, getEditorToolShortcutLabel } from '@/editor';
import type { EditorTool } from '@/editor';
import UiIconButton from '@/ui/components/base/UiIconButton.vue';
import UiLiquidIndicator from '@/ui/components/base/UiLiquidIndicator.vue';
import { useLiquidIndicator } from '@/ui/composables/useLiquidIndicator';

const props = defineProps<{ activeTool: EditorTool }>();
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
const hoveredTool = ref<EditorTool | null>(null);
const focusedTool = ref<EditorTool | null>(null);
const visibleTooltipTool = computed(() => focusedTool.value ?? hoveredTool.value);
const dock = ref<HTMLElement | null>(null);
const indicator = useLiquidIndicator(dock);
const { x, y, width, height, ready, motionRevision } = indicator;
function measureActiveTool(): void {
  indicator.setTarget(dock.value?.querySelector<HTMLElement>('.ui-icon-button.is-active') ?? null);
}
onMounted(measureActiveTool);
watch(
  () => props.activeTool,
  async () => {
    await nextTick();
    measureActiveTool();
  },
  { flush: 'post' },
);
let hoverTimer: ReturnType<typeof setTimeout> | null = null;

function clearHoverTimer(): void {
  if (hoverTimer === null) return;
  clearTimeout(hoverTimer);
  hoverTimer = null;
}

function scheduleTooltip(event: PointerEvent, tool: EditorTool): void {
  if (event.pointerType !== 'mouse') return;
  clearHoverTimer();
  hoverTimer = setTimeout(() => {
    hoveredTool.value = tool;
    hoverTimer = null;
  }, 350);
}

function hideTooltip(): void {
  clearHoverTimer();
  hoveredTool.value = null;
}

function handlePointerDown(event: PointerEvent): void {
  if (event.pointerType !== 'mouse') return;
  event.preventDefault();
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
}

onBeforeUnmount(clearHoverTimer);
</script>

<template>
  <nav ref="dock" class="tool-dock" aria-label="编辑工具">
    <UiLiquidIndicator
      :x="x"
      :y="y"
      :width="width"
      :height="height"
      :ready="ready"
      :motion-revision="motionRevision"
      variant="tool"
    />
    <span
      v-for="tool in EDITOR_TOOLS"
      :key="tool"
      class="tool-dock__item"
      @pointerenter="scheduleTooltip($event, tool)"
      @pointerleave="hideTooltip"
    >
      <UiIconButton
        size="tool"
        :class="{ 'is-active': activeTool === tool }"
        :label="`${toolLabels[tool]}，快捷键 ${getEditorToolShortcutLabel(tool)}`"
        :aria-pressed="activeTool === tool"
        @pointerdown="handlePointerDown"
        @focus="focusedTool = tool"
        @blur="focusedTool = null"
        @click="emit('select-tool', tool)"
      >
        <component :is="toolIcons[tool]" :size="18" aria-hidden="true" />
      </UiIconButton>
      <Transition name="tool-dock-tooltip-motion">
        <span v-if="visibleTooltipTool === tool" class="tool-dock__tooltip" aria-hidden="true">
          {{ toolLabels[tool] }}
        </span>
      </Transition>
    </span>
  </nav>
</template>
