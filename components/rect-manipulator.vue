<script setup lang="ts">
  import { ref, computed, defineEmits } from "vue";

  defineEmits<{
    onMove: [{ x: number; y: number }];
    onResize: [{ width: number; height: number }];
  }>();

  const manipulatorEl = ref<HTMLElement | null>(null);

  enum Direction {
    TL = 'tl',
    T = 't',
    TR = 'tr',
    L = 'l',
    R = 'r',
    BL = 'bl',
    B = 'b',
    BR = 'br',
    C = 'c'
  }

  const width = ref(140);
  const height = ref(80);
  const x = ref(0);
  const y = ref(0);
  const resizeEnable = ref(false);
  const startPosition = ref({ x: 0, y: 0 });
  const endPosition = ref({ x: 0, y: 0 });
  const direction = ref<Direction>(Direction.B);
  const delta = ref({ x: 0, y: 0, width: 0, height: 0 });

  const cssVariables = computed(() => ({
    '--width': `${width.value - delta.value.width}`,
    '--height': `${height.value - delta.value.height}`,
    transform: `translate(${x.value - delta.value.x}px, ${y.value - delta.value.y}px)`,
  }));

  const resizeDirectionHandlers = {
    [Direction.TL]: () => {
      if (endPosition.value.x - startPosition.value.x > width.value) {
        return;
      }
      if (endPosition.value.y - startPosition.value.y > height.value) {
        return;
      }
      delta.value = {
        x: startPosition.value.x - endPosition.value.x,
        y: startPosition.value.y - endPosition.value.y,
        width: endPosition.value.x - startPosition.value.x,
        height: endPosition.value.y - startPosition.value.y
      };
    },
    [Direction.T]: () => {
      if (endPosition.value.y - startPosition.value.y > height.value) {
        return;
      }
      delta.value = {
        x: 0,
        y: startPosition.value.y - endPosition.value.y,
        width: 0,
        height: endPosition.value.y - startPosition.value.y
      };
    },
    [Direction.TR]: () => {
      if (startPosition.value.x - endPosition.value.x > width.value) {
        return;
      }
      if (endPosition.value.y - startPosition.value.y > height.value) {
        return;
      }
      delta.value = {
        x: 0,
        y: startPosition.value.y - endPosition.value.y,
        width: startPosition.value.x - endPosition.value.x,
        height: endPosition.value.y - startPosition.value.y
      };
    },
    [Direction.L]: () => {
      if (endPosition.value.x - startPosition.value.x > width.value) {
        return;
      }
      delta.value = {
        x: startPosition.value.x - endPosition.value.x,
        y: 0,
        width: endPosition.value.x - startPosition.value.x,
        height: 0
      };
    },
    [Direction.R]: () => {
      if (startPosition.value.x - endPosition.value.x > width.value) {
        return;
      }
      delta.value = {
        x: 0,
        y: 0,
        width: startPosition.value.x - endPosition.value.x,
        height: 0
      };
    },
    [Direction.BL]: () => {
      if (startPosition.value.y - endPosition.value.y > height.value) {
        return;
      }
      if (endPosition.value.x - startPosition.value.x > width.value) {
        return;
      }
      delta.value = {
        x: startPosition.value.x - endPosition.value.x,
        y: 0,
        width: endPosition.value.x - startPosition.value.x,
        height: (endPosition.value.y - startPosition.value.y) * -1
      };
    },
    [Direction.B]: () => {
      if (startPosition.value.y - endPosition.value.y > height.value) {
        return;
      }
      delta.value = {
        x: 0,
        y: 0,
        width: 0,
        height: startPosition.value.y - endPosition.value.y
      };
    },
    [Direction.BR]: () => {
      if (startPosition.value.x - endPosition.value.x > width.value) {
        return;
      }
      if (startPosition.value.y - endPosition.value.y > height.value) {
        return;
      }
      delta.value = {
        x: 0,
        y: 0,
        width: startPosition.value.x - endPosition.value.x,
        height: startPosition.value.y - endPosition.value.y
      };
    },
    [Direction.C]: () => {
      delta.value = {
        x: startPosition.value.x - endPosition.value.x,
        y: startPosition.value.y - endPosition.value.y,
        width: 0,
        height: 0
      };
    }
  };

  const stop = () => {
    resizeEnable.value = false;
    width.value -= Math.round(delta.value.width);
    height.value -= Math.round(delta.value.height);
    x.value -= Math.round(delta.value.x);
    y.value -= Math.round(delta.value.y);
    delta.value = { x: 0, y: 0, width: 0, height: 0 };
  };

  const move = (e: PointerEvent) => {
    if (resizeEnable.value) {
      endPosition.value = {
        x: e.clientX,
        y: e.clientY
      };
      if (direction.value in resizeDirectionHandlers) {
        resizeDirectionHandlers[direction.value]();
      }
    }
  };

  const start = (e: PointerEvent) => {
    const target = e.target as HTMLElement;
    if (!target || !target.dataset) {
      stop();
      return;
    }
    const directionResize = target.dataset.direction as Direction;
    if (directionResize && directionResize in resizeDirectionHandlers) {
      direction.value = directionResize;
      resizeEnable.value = true;
      startPosition.value = {
        x: e.clientX,
        y: e.clientY
      };
    } else {
      stop();
    }
  };

  useEventListener(manipulatorEl, 'pointerdown', start, true);
  useEventListener(window, 'pointermove', move, true);
  useEventListener(window, 'pointerup', stop, true);
</script>

<template>
<div class="relative grid grid-cols-[12px_1px_12px] grid-rows-[12px_1px_12px] place-content-center cursor-move" :style="cssVariables" ref="manipulatorEl">
  <div data-direction="tl" class="rec-manipulator bg-orange bottom-0 left-0"></div>
  <div data-direction="t" class="rec-manipulator bg-red w-1px scale-x-[--width] origin-top-left"></div>
  <div data-direction="tr" class="rec-manipulator bg-orange bottom-0 left-0 translate-x-[calc(var(--width,1)*1px-1px)]"></div>
  <div data-direction="l" class="rec-manipulator bg-red h-1px scale-y-[--height] origin-top-left"></div>
  <div data-direction="c" class="w-1px h-1px bg-blue-700 scale-x-[--width] scale-y-[--height] origin-top-left">

  </div>
  <div data-direction="r" class="rec-manipulator bg-red h-1px scale-y-[--height] origin-top-left  translate-x-[calc(var(--width)*1px-1px)]"></div>
  <div data-direction="bl" class="rec-manipulator bg-orange bottom-0 left-0 translate-y-[calc(var(--height)*1px-1px)]"></div>
  <div data-direction="b" class="rec-manipulator bg-red w-1px scale-x-[--width] origin-top-left translate-y-[calc(var(--height)*1px-1px)]"></div>
  <div data-direction="br" class="rec-manipulator bg-orange bottom-0 right-0 translate-x-[calc(var(--width)*1px-1px)] translate-y-[calc(var(--height)*1px-1px)]"></div>
</div>
</template>

<style scoped>
.rec-manipulator[data-direction=b],.rec-manipulator[data-direction=t] {
  cursor: ns-resize;
}
.rec-manipulator[data-direction=l],.rec-manipulator[data-direction=r] {
  cursor: ew-resize;
}
.rec-manipulator[data-direction=bl],.rec-manipulator[data-direction=tr] {
  cursor: nesw-resize;
}
.rec-manipulator[data-direction=br],.rec-manipulator[data-direction=tl] {
  cursor: nwse-resize;
}
</style>