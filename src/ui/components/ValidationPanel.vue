<script setup lang="ts">
import { computed } from 'vue';
import type { ValidationIssue } from '@/core/validation';
import { VALIDATION_PRESENTATION } from '@/ui/presentation/ValidationPresentation';
import type { ValidationStatus } from '@/ui/stores/editorStore';

const props = defineProps<{
  status: ValidationStatus;
  issues: readonly ValidationIssue[];
  focusedIssue?: ValidationIssue | null;
}>();
const emit = defineEmits<{ 'focus-issue': [issue: ValidationIssue] }>();
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
  <section class="panel validation-panel">
    <header class="panel-header">
      <h2 class="panel-title">校验结果</h2>
      <span v-if="status === 'failed'" class="validation-count">
        {{ errorCount }} 个错误<span v-if="warningCount > 0"> · {{ warningCount }} 条警告</span>
      </span>
      <span v-else-if="status === 'passed' && warningCount > 0" class="validation-count warning">
        {{ warningCount }} 条警告
      </span>
    </header>

    <div class="panel-content validation-content">
      <div v-if="status === 'not-run'" class="empty-state">
        <p>尚未运行校验</p>
        <p>点击顶部“校验”检查当前地图。</p>
      </div>
      <div v-else-if="status === 'stale'" class="empty-state">
        <p>校验结果已过期</p>
        <p>地图在上次校验后已经发生修改，请重新运行校验。</p>
      </div>
      <div v-else-if="status === 'passed'" class="empty-state">
        <p>校验通过</p>
        <p>未发现当前校验规则定义的错误。</p>
      </div>
      <div v-else class="issue-list">
        <template
          v-for="(issue, index) in issues"
          :key="`${issue.code}-${issue.position?.x ?? ''}-${issue.position?.y ?? ''}-${index}`"
        >
          <button
            v-if="issue.position !== undefined"
            type="button"
            class="issue-row"
            :class="[`issue-row--${issue.severity}`, { 'issue-row--focused': isFocused(issue) }]"
            :aria-current="isFocused(issue) ? 'true' : undefined"
            @click="emit('focus-issue', issue)"
          >
            <span class="issue-severity">{{ issue.severity === 'error' ? '错误' : '警告' }}</span>
            <span class="issue-title">{{ presentation(issue).title }}</span>
            <span class="issue-description">{{ presentation(issue).description }}</span>
            <span class="issue-meta">X {{ issue.position.x }} · Y {{ issue.position.y }}</span>
            <span class="issue-code">{{ issue.code }}</span>
          </button>
          <div
            v-else
            class="issue-row"
            :class="[`issue-row--${issue.severity}`, { 'issue-row--focused': isFocused(issue) }]"
          >
            <span class="issue-severity">{{ issue.severity === 'error' ? '错误' : '警告' }}</span>
            <span class="issue-title">{{ presentation(issue).title }}</span>
            <span class="issue-description">{{ presentation(issue).description }}</span>
            <span class="issue-code">{{ issue.code }}</span>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
.validation-panel {
  background: var(--color-panel-background);
}
.validation-count {
  color: #b91c1c;
  font-size: 0.75rem;
  font-weight: 600;
}
.validation-count.warning {
  color: #b45309;
}
.validation-content {
  min-height: 0;
}
.issue-list {
  display: grid;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
}
.issue-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 0.125rem 0.5rem;
  width: 100%;
  padding: 0.5rem;
  color: #334155;
  text-align: left;
  background: #fff;
  border: 1px solid #fecaca;
  border-left: 3px solid #dc2626;
  border-radius: 0.25rem;
}
button.issue-row {
  cursor: pointer;
}
.issue-row--warning {
  border-color: #fde68a;
  border-left-color: #d97706;
}
.issue-row--focused {
  background: #fef2f2;
  outline: 2px solid #fca5a5;
  outline-offset: 1px;
}
.issue-severity {
  grid-row: span 2;
  align-self: start;
  color: #b91c1c;
  font-size: 0.75rem;
  font-weight: 700;
}
.issue-row--warning .issue-severity {
  color: #b45309;
}
.issue-title {
  font-size: 0.8125rem;
  font-weight: 650;
}
.issue-description,
.issue-meta,
.issue-code {
  grid-column: 2;
  color: #64748b;
  font-size: 0.75rem;
}
.issue-code {
  color: #94a3b8;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}
</style>
