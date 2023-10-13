import { defineStore } from 'pinia'

export interface Frame {
  id: string
  name: string
  width: number
  height: number
}

export const useFramesStore = defineStore('frames', () => {
  const frames = ref<Frame[]>([
    {
      id: '1',
      name: 'Frame 1',
      width: 320,
      height: 480,
    },
  ])

  const currentFrameId = ref<string>('1')

  return {
    frames,
    currentFrameId,
  }
})
