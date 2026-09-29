<script setup lang="ts">
import { computed } from 'vue';
import type { ValidationIssue } from '@/core/validation';
import { VALIDATION_PRESENTATION } from '@/ui/presentation/ValidationPresentation';
import type { ValidationStatus } from '@/ui/stores/editorStore';
import UiIconButton from '@/ui/components/base/UiIconButton.vue';
import { X } from 'lucide-vue-next';

const props = defineProps<{
  status: ValidationStatus;
  issues: readonly ValidationIssue[];
  focusedIssue?: ValidationIssue | null;
}>();
const emit = defineEmits<{ 'focus-issue': [issue: ValidationIssue]; close: [] }>();
const errorCount = computed(
  () => props.issues.filter((issue) => issue.severity === 'error').length,
);
const warningCount = computed(
  () => props.issues.filter((issue) => issue.severity === 'warning').length,
);
function presentation(issue: ValidationIssue) {
  return VALIDATION_PRESENTATION[issue.code];
}
function isFocused(issue: ValidationIssue): boolean {
  return props.focusedIssue === issue;
}
</script>

<template>
  <section id="validation-drawer" class="validation-drawer" aria-label="校验结果">
    <header class="validation-drawer__header">
      <div>
        <h2 class="validation-drawer__title">校验结果</h2>
        <p v-if="status === 'failed'" class="validation-drawer__count">
          {{ errorCount }} 个错误<span v-if="warningCount > 0"> · {{ warningCount }} 条警告</span>
        </p>
        <p
          v-else-if="status === 'passed' && warningCount > 0"
          class="validation-drawer__count validation-drawer__count--warning"
        >
          {{ warningCount }} 条警告
        </p>
      </div>
      <UiIconButton label="关闭校验结果" size="compact" @click="emit('close')">
        <X :size="16" aria-hidden="true" />
      </UiIconButton>
    </header>

    <div class="validation-drawer__content">
      <div v-if="status === 'not-run'" class="validation-drawer__empty">
        <p>尚未运行校验</p>
        <p>点击顶部“校验”检查当前地图。</p>
      </div>
      <div v-else-if="status === 'stale'" class="validation-drawer__empty">
        <p>校验结果已过期</p>
        <p>地图在上次校验后已经发生修改，请重新运行校验。</p>
      </div>
      <div v-else-if="status === 'passed' && issues.length === 0" class="validation-drawer__empty">
        <p>校验通过</p>
        <p>未发现当前校验规则定义的问题。</p>
      </div>
      <div v-else class="validation-issue-list">
        <template
          v-for="(issue, index) in issues"
          :key="`${issue.code}-${issue.position?.x ?? ''}-${issue.position?.y ?? ''}-${index}`"
        >
          <button
            v-if="issue.position !== undefined"
            type="button"
            class="validation-issue"
            :class="[
              `validation-issue--${issue.severity}`,
              { 'validation-issue--focused': isFocused(issue) },
            ]"
            :aria-current="isFocused(issue) ? 'true' : undefined"
            @click="emit('focus-issue', issue)"
          >
            <span class="validation-issue__severity">{{
              issue.severity === 'error' ? '错误' : '警告'
            }}</span>
            <span class="validation-issue__title">{{ presentation(issue).title }}</span>
            <span class="validation-issue__description">{{ presentation(issue).description }}</span>
            <span class="validation-issue__meta"
              >X {{ issue.position.x }} · Y {{ issue.position.y }}</span
            >
            <span class="validation-issue__code">{{ issue.code }}</span>
          </button>
          <div
            v-else
            class="validation-issue"
            :class="[
              `validation-issue--${issue.severity}`,
              { 'validation-issue--focused': isFocused(issue) },
            ]"
          >
            <span class="validation-issue__severity">{{
              issue.severity === 'error' ? '错误' : '警告'
            }}</span>
            <span class="validation-issue__title">{{ presentation(issue).title }}</span>
            <span class="validation-issue__description">{{ presentation(issue).description }}</span>
            <span class="validation-issue__code">{{ issue.code }}</span>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>
