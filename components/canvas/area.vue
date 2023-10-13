<script setup lang="ts">
interface Props {
  x: number; // Координата x области.
  y: number; // Координата y области.
  width: number; // Ширина области.
  height: number; // Высота области.
  color?: string; // Цвет области. По умолчанию 'rgba(255, 255, 255, 0.1)'.
  opacity?: number; // Прозрачность области. По умолчанию 0.
}

const props = withDefaults(defineProps<Props>(), {
  color: 'rgba(255, 255, 255, 0.1)',
  opacity: 0
});

const areaTransform = computed(() => `translate(${props.x}px, ${props.y}px) scale(${props.width}, ${props.height})`)

</script>

<template>
  <div class="absolute pointer-events-none top-0 left-0 w-1px h-1px origin-top-left"  :style="{
    backgroundColor: props.color,
    opacity: props.opacity,
    transform: areaTransform
  }"></div>
</template>

