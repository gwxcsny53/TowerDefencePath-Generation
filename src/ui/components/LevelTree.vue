<template>
  <section class="panel">
    <header class="panel-header">
      <h2 class="panel-title">关卡</h2>
      <div class="level-tree-actions" aria-label="关卡操作">
        <button type="button" disabled>新建</button>
        <button type="button" disabled>复制</button>
        <button type="button" disabled>删除</button>
      </div>
    </header>

    <div class="panel-content">
      <div class="empty-state">
        <p>暂无关卡</p>
        <p>新建关卡功能将在后续接入</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.level-tree-actions {
  display: flex;
  gap: 0.25rem;
}

.level-tree-actions button {
  padding: 0.25rem 0.375rem;
  color: #94a3b8;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}
</style>
