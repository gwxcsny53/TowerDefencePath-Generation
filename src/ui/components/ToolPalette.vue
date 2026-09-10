<template>
  <section class="tool-palette" aria-label="编辑工具">
    <span class="tool-palette-label">工具</span>
    <div class="tool-palette-actions">
      <button type="button" disabled>选择</button>
      <button type="button" disabled>路线</button>
      <button type="button" disabled>出生点</button>
      <button type="button" disabled>终点</button>
      <button type="button" disabled>塔位</button>
      <button type="button" disabled>橡皮擦</button>
    </div>
  </section>
</template>

<style scoped>
.tool-palette {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  padding: 0 1rem;
  overflow: hidden;
  background: var(--color-panel-background);
  border-top: 1px solid var(--color-panel-border);
  border-bottom: 1px solid var(--color-panel-border);
}

.tool-palette-label {
  color: #475569;
  font-size: 0.875rem;
  font-weight: 650;
}

.tool-palette-actions {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
  overflow: auto hidden;
}

.tool-palette-actions button {
  flex: 0 0 auto;
  padding: 0.375rem 0.625rem;
  color: #64748b;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 0.25rem;
}
</style>
