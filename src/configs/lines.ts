import type { LinePoint } from '@/types/slides'


export interface LinePoolItem {
  path: string
  style: 'solid' | 'dashed'
  points: [LinePoint, LinePoint]
  isBroken?: boolean
  isCurve?: boolean
  isCubic?: boolean
}

interface PresetLine {
  type: string
  children: LinePoolItem[]
}

export const LINE_LIST: PresetLine[] = [
  {
    type: 'straight line',
    children: [
      { path: 'M 0 0 L 20 20', style: 'solid', points: ['', ''] },
      { path: 'M 0 0 L 20 20', style: 'dashed', points: ['', ''] },
      { path: 'M 0 0 L 20 20', style: 'solid', points: ['', 'arrow'] },
      { path: 'M 0 0 L 20 20', style: 'dashed', points: ['', 'arrow'] },
      { path: 'M 0 0 L 20 20', style: 'solid', points: ['', 'dot'] },
    ],
  },
  {
    type: 'polyline, curve',
    children: [
      { path: 'M 0 0 L 0 20 L 20 20', style: 'solid', points: ['', 'arrow'], isBroken: true },
      { path: 'M 0 0 Q 0 20 20 20', style: 'solid', points: ['', 'arrow'], isCurve: true },
      { path: 'M 0 0 C 20 0 0 20 20 20', style: 'solid', points: ['', 'arrow'], isCubic: true },
    ],
  },
]