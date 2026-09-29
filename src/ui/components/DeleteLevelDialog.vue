<script setup lang="ts">
import type { LevelAddress } from '@/editor';
import UiButton from './base/UiButton.vue';
import UiDialog from './base/UiDialog.vue';

defineProps<{ open: boolean; address: LevelAddress }>();
const emit = defineEmits<{ cancel: []; confirm: [] }>();
</script>

<template>
  <Teleport to="body">
    <UiDialog :open="open" title="删除关卡" size="compact" @close-request="emit('cancel')">
      <p>确定删除 第 {{ address.chapter }} 章 · 第 {{ address.stage }} 关？</p>
      <p>该关卡中的地图内容和路口配置将一并从当前项目中移除。</p>
      <template #footer>
        <UiButton variant="secondary" @click="emit('cancel')">取消</UiButton>
        <UiButton variant="danger" @click="emit('confirm')">删除关卡</UiButton>
      </template>
    </UiDialog>
  </Teleport>
</template>
