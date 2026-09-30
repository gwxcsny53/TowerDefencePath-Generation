import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { Ref } from 'vue';

export function useLiquidIndicator(container: Ref<HTMLElement | null>) {
  const x = ref(0);
  const y = ref(0);
  const width = ref(0);
  const height = ref(0);
  const ready = ref(false);
  const motionRevision = ref(0);
  let target: HTMLElement | null = null;
  let frame = 0;
  const observer = new ResizeObserver(() => scheduleMeasure());

  function measure(): void {
    frame = 0;
    const parent = container.value;
    if (parent === null || target === null || !target.isConnected) {
      ready.value = false;
      return;
    }
    const containerRect = parent.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    x.value = targetRect.left - containerRect.left - parent.clientLeft + parent.scrollLeft;
    y.value = targetRect.top - containerRect.top - parent.clientTop + parent.scrollTop;
    width.value = targetRect.width;
    height.value = targetRect.height;
    ready.value = true;
  }

  function scheduleMeasure(): void {
    if (frame === 0) frame = requestAnimationFrame(measure);
  }

  function setTarget(nextTarget: HTMLElement | null): void {
    if (target !== nextTarget) {
      if (target !== null) observer.unobserve(target);
      if (ready.value && nextTarget !== null) motionRevision.value += 1;
      target = nextTarget;
      if (target !== null) observer.observe(target);
    }
    scheduleMeasure();
  }

  onMounted(() => {
    if (container.value !== null) observer.observe(container.value);
    scheduleMeasure();
  });
  onBeforeUnmount(() => {
    observer.disconnect();
    if (frame !== 0) cancelAnimationFrame(frame);
  });

  return { x, y, width, height, ready, motionRevision, setTarget, scheduleMeasure };
}
