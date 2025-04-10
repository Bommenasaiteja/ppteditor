import type { ComposeOption } from 'echarts/core'
import type {
  BarSeriesOption,
  LineSeriesOption,
  PieSeriesOption,
  ScatterSeriesOption,
  RadarSeriesOption,
} from 'echarts/charts'
import type { ChartData, ChartType } from '@/types/slides'

type EChartOption = ComposeOption<BarSeriesOption | LineSeriesOption | PieSeriesOption | ScatterSeriesOption | RadarSeriesOption>

export interface ChartOptionPayload {
  type: ChartType
  data: ChartData
  themeColors: string[]
  textColor?: string
  lineSmooth?: boolean
  stack?: boolean
}

export const getChartOption = ({
  type,
  data,
  themeColors,
  textColor,
  lineSmooth,
  stack,
}: ChartOptionPayload): EChartOption | null => {
  if (type === 'bar') {
    return {
      color: themeColors,
      textStyle: textColor ? {
        color: textColor,
      } : {},
      legend: data.series.length > 0 ? {
        top: 'bottom',
        textStyle: textColor ? {
          color: textColor,
        } : {},
      } : undefined,
      
      grid: {
        left: '5%',
        right: '5%',
        bottom: '10%', // Add space at the bottom for rotated labels
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.labels,
        axisLabel: {
          interval: 0,
          formatter: (value: string) => {
            const maxLength = 20 // Max characters per line
            const lines = []
            for (let i = 0; i < value.length; i += maxLength) {
              lines.push(value.slice(i, i + maxLength))
            }
            return lines.join('\n') // Join lines with newline character
          },
          fontSize: 10,
          lineHeight: 14, // Adjust line height for wrapped text
        },
      },
      yAxis: {
        type: 'value',  
        axisLine: {
          show: true,
        },
      },
      series: data.series.map((item, index) => {
        const seriesItem: BarSeriesOption = {
          data: item,
          name: data.legends[index],
          type: 'bar',
          label: {
            show: false, // Hide labels by default
          },
          emphasis: { // Show labels on hover
            label: {
              show: true,
              position: 'top',
              color: textColor || '#000',
              fontSize: 12,
            }
          },
        }
        if (stack) seriesItem.stack = 'A'
        return seriesItem
      }),
    }
  }
  if (type === 'horizontalBar') {
    return {
      color: themeColors,
      textStyle: textColor ? {
        color: textColor,
      } : {},
      legend: data.series.length > 0 ? {
        top: 'bottom',
        textStyle: textColor ? {
          color: textColor,
        } : {},
      } : undefined,
      yAxis: {
        type: 'category',
        data: data.labels,
        axisLabel: {
          interval: 0,
          formatter: (value: string) => {
            const maxLength = 20 // Max characters per line
            const lines = []
            for (let i = 0; i < value.length; i += maxLength) {
              lines.push(value.slice(i, i + maxLength))
            }
            return lines.join('\n') // Join lines with newline character
          },
          fontSize: 10,
          lineHeight: 14, // Adjust line height for wrapped text
        },
      },
      xAxis: {
        type: 'value',
        axisLine: {
          show: true,
        },
      },
      grid: {
        left: '5%',
        right: '5%',
        bottom: '10%',
        top: '5%',
        containLabel: true,
      },
      series: data.series.map((item, index) => {
        const seriesItem: BarSeriesOption = {
          data: item,
          name: data.legends[index],
          type: 'bar',
          label: {
            show: false, // Hide labels by default
          },
          emphasis: { // Show labels on hover
            label: {
              show: true,
              position: 'top',
              color: textColor || '#000',
              fontSize: 12,
            }
          },
        }
        if (stack) seriesItem.stack = 'A'
        return seriesItem
      }),
    }
  }
  if (type === 'line') {
    return {
      color: themeColors,
      textStyle: textColor ? {
        color: textColor,
      } : {},
      legend: data.series.length > 0 ? {
        top: 'bottom',
        textStyle: textColor ? {
          color: textColor,
        } : {},
      } : undefined,
      xAxis: {
        type: 'category',
        data: data.labels,
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: true,
        },
        splitLine: { // Configure grid lines
          show: true, // Ensure grid lines are visible
          lineStyle: {
            color: '#E0E6F1', // Change grid line color (e.g., light gray)
            width: 1.2, 
            type: 'dashed' // Optional: 'solid', 'dashed', 'dotted'
          }
        }
      },
      series: data.series.map((item, index) => {
        const seriesItem: LineSeriesOption = {
          data: item,
          name: data.legends[index],
          type: 'line',
          smooth: lineSmooth,
          label: {
            show: false, // Hide labels by default
          },
          emphasis: { // Show labels on hover
            label: {
              show: true,
              position: 'top',
              color: textColor || '#000',
              fontSize: 12,
            }
          },
        }
        if (stack) seriesItem.stack = 'A'
        return seriesItem
      }),
    }
  }
  if (type === 'pie') {
    return {
      color: themeColors,
      textStyle: textColor ? {
        color: textColor,
      } : {},
      legend: {
        top: 'bottom',
        textStyle: textColor ? {
          color: textColor,
        } : {},
      },
      series: [
        {
          data: data.series[0].map((item, index) => ({ value: item, name: data.labels[index] })),
          label: textColor ? {
            color: textColor,
          } : {},
          type: 'pie',
          radius: '70%',
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 'bold'
            },
          },
        }
      ],
    }
  }
  if (type === 'ring') {
    return {
      color: themeColors,
      textStyle: textColor ? {
        color: textColor,
      } : {},
      legend: {
        top: 'bottom',
        textStyle: textColor ? {
          color: textColor,
        } : {},
      },
      series: [
        {
          data: data.series[0].map((item, index) => ({ value: item, name: data.labels[index] })),
          label: textColor ? {
            color: textColor,
          } : {},
          type: 'pie',
          radius: ['40%', '70%'],
          padAngle: 1,
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            },
          },
        }
      ],
    }
  }
  if (type === 'area') {
    return {
      color: themeColors,
      textStyle: textColor ? {
        color: textColor,
      } : {},
      legend: data.series.length > 0 ? {
        top: 'bottom',
        textStyle: textColor ? {
          color: textColor,
        } : {},
      } : undefined,
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.labels,
      },
      yAxis: {
        type: 'value',
      },
      series: data.series.map((item, index) => {
        const seriesItem: LineSeriesOption = {
          data: item,
          name: data.legends[index],
          type: 'line',
          areaStyle: {},
          label: {
            show: true,
          },
        }
        if (stack) seriesItem.stack = 'A'
        return seriesItem
      }),
    }
  }

  if (type === 'scatter') {
    const formatedData = []
    for (let i = 0; i < data.series[0].length; i++) {
      const x = data.series[0][i]
      const y = data.series[1] ? data.series[1][i] : x
      formatedData.push([x, y])
    }

    return {
      color: themeColors,
      textStyle: textColor ? {
        color: textColor,
      } : {},
      xAxis: {},
      yAxis: {},
      series: [
        {
          symbolSize: 12,
          data: formatedData,
          type: 'scatter',
        }
      ],
    }
  }

  return null
}