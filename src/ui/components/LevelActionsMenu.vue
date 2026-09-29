<script setup lang="ts">
import { MoreHorizontal } from 'lucide-vue-next';
import UiButton from './base/UiButton.vue';
import UiIconButton from './base/UiIconButton.vue';
import UiPopover from './base/UiPopover.vue';

defineProps<{ canDelete: boolean }>();
const emit = defineEmits<{
  duplicate: [];
  resize: [];
  delete: [];
}>();
</script>

<template>
  <UiPopover placement="auto">
    <template #trigger="{ toggle }">
      <UiIconButton label="当前关卡操作" size="compact" @click="toggle">
        <MoreHorizontal :size="16" aria-hidden="true" />
      </UiIconButton>
    </template>
    <template #default="{ close }">
      <UiButton variant="ghost" size="sm" @click="(close(), emit('duplicate'))">复制关卡</UiButton>
      <UiButton variant="ghost" size="sm" @click="(close(), emit('resize'))"> 调整尺寸 </UiButton>
      <div class="level-actions-menu__separator"></div>
      <UiButton variant="danger" size="sm" :disabled="!canDelete" @click="(close(), emit('delete'))"
        >删除关卡</UiButton
      >
      <p v-if="!canDelete" class="level-actions-menu__reason">至少需要保留一个关卡</p>
    </template>
  </UiPopover>
</template>
