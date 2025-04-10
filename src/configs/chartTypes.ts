import type { ChartType } from '@/types/slides'

interface ChartTypes {
  [propName: string]: ChartType
}

export const CHART_TYPES: ChartTypes = {
  bar: 'bar',
  horizontalBar: 'horizontalBar',
  line: 'line',
  area: 'area',
  scatter: 'scatter',
  pie: 'pie',
  ring: 'ring',
}