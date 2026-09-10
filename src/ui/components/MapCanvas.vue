<template>
  <section class="map-canvas-host">
    <canvas aria-label="塔防关卡地图编辑区域"></canvas>
    <div class="map-placeholder" aria-hidden="true">
      <p>地图编辑区</p>
      <span>后续将在此显示关卡网格与路线</span>
    </div>
  </section>
</template>

<style scoped>
.map-canvas-host {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #e2e8f0;
}

canvas {
  display: block;
  width: 100%;
  height: 100%;
  border: 1px solid #cbd5e1;
  background: #e2e8f0;
}

.map-placeholder {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  gap: 0.375rem;
  padding: 1rem;
  color: #64748b;
  text-align: center;
  pointer-events: none;
}

.map-placeholder p,
.map-placeholder span {
  margin: 0;
}

.map-placeholder p {
  color: #475569;
  font-weight: 600;
}

.map-placeholder span {
  font-size: 0.875rem;
}
</style>
