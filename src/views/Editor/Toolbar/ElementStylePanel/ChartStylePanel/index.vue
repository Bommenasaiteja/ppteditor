<template>
  <div class="chart-style-panel">
    <Button class="full-width-btn" @click="chartDataEditorVisible = true">
      <IconEdit class="btn-icon" /> Edit chart data
    </Button>

   

    <template v-if="['bar', 'horizontalBar', 'area', 'line'].includes(handleChartElement.chartType)">
      <Divider />
      <div class="row">
      <Checkbox
        @update:value="(value) => updateOptions({ stack: value })"
        :value="stack"
        style="flex: 1"
        >Stacking style</Checkbox>
      <Checkbox 
          v-if="handleChartElement.chartType === 'line'"
          @update:value="value => updateOptions({ lineSmooth: value })" 
          :value="lineSmooth"
          style="flex: 3;"
        >lineSmooth</Checkbox>
    </div>
    <Divider />
    </template>

    <!-- <div class="row">
      <div style="width: 40%">legend:</div>
      <Select
        style="width: 60%"
        :value="legend"
        @update:value="value => updateLegend(value as '' | 'top' | 'bottom')"
        :options="[
          { label: 'Do not display', value: '' },
          { label: 'display above', value: 'top' },
          { label: 'Show below', value: 'bottom' },
        ]"
      />
    </div> -->

    <Divider />

    <div class="row">
      <div style="width: 40%">Background fill:</div>
      <Popover trigger="click" style="width: 60%">
        <template #content>
          <ColorPicker
            :modelValue="fill"
            @update:modelValue="(value) => updateFill(value)"
          />
        </template>
        <ColorButton :color="fill" />
      </Popover>
    </div>
    <div class="row">
      <div style="width: 40%">Text color:</div>
      <Popover trigger="click" style="width: 60%">
        <template #content>
          <ColorPicker
            :modelValue="gridColor"
            @update:modelValue="(value) => updateTextColor(value)"
          />
        </template>
        <ColorButton :color="gridColor" />
      </Popover>
    </div>

    <Divider />

    <div class="row" v-for="(color, index) in themeColor" :key="index">
      <div style="width: 40%">{{ index === 0 ? 'Theme color: ' : '' }}</div>
      <Popover trigger="click" style="width: 60%">
        <template #content>
          <ColorPicker
            :modelValue="color"
            @update:modelValue="(value) => updateTheme(value, index)"
          />
        </template>
        <div class="color-btn-wrap" style="width: 100%">
          <ColorButton :color="color" />
          <div
            class="delete-color-btn"
            v-tooltip="'Delete'"
            @click.stop="deleteThemeColor(index)"
            v-if="index !== 0"
          >
            <IconCloseSmall />
          </div>
        </div>
      </Popover>
    </div>
    <ButtonGroup class="row" passive>
      <Popover
        trigger="click"
        v-model:open="presetThemesVisible"
        style="width: 40%"
      >
        <template #content>
          <div class="preset-themes">
            <div
              class="preset-theme"
              v-for="(item, index) in presetChartThemes"
              :key="index"
            >
              <div
                class="preset-theme-color"
                :class="{
                  select:
                    presetThemeColorHoverIndex[0] === index &&
                    itemIndex <= presetThemeColorHoverIndex[1],
                }"
                v-for="(color, itemIndex) in item"
                :key="color"
                :style="{ backgroundColor: color }"
                @click="applyPresetTheme(item, itemIndex)"
                @mouseenter="presetThemeColorHoverIndex = [index, itemIndex]"
                @mouseleave="presetThemeColorHoverIndex = [-1, -1]"
              ></div>
            </div>
          </div>
        </template>
        <Button first style="width: 100%">Recommended topics</Button>
      </Popover>
      <Button
        last
        :disabled="themeColor.length >= 10"
        style="width: 60%"
        @click="addThemeColor()"
      >
        <IconPlus class="btn-icon" /> Add theme color
      </Button>
    </ButtonGroup>

    <Divider />

    <ElementOutline />

    <Modal v-model:visible="chartDataEditorVisible" :width="640">
      <ChartDataEditor
        :data="handleChartElement.data"
        @close="chartDataEditorVisible = false"
        @save="(value) => updateData(value)"
      />
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { onUnmounted, ref, watch, type Ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import type { ChartData, ChartOptions, PPTChartElement } from '@/types/slides'
import emitter, { EmitterEvents } from '@/utils/emitter'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

import ElementOutline from '../../common/ElementOutline.vue'
import ColorButton from '../../common/ColorButton.vue'
import ChartDataEditor from './ChartDataEditor.vue'
import ColorPicker from '@/components/ColorPicker/index.vue'
import Modal from '@/components/Modal.vue'
import Divider from '@/components/Divider.vue'
import Checkbox from '@/components/Checkbox.vue'
import Button from '@/components/Button.vue'
import ButtonGroup from '@/components/ButtonGroup.vue'
import Select from '@/components/Select.vue'
import Popover from '@/components/Popover.vue'

const presetChartThemes = [
  ['#d87c7c', '#919e8b', '#d7ab82', '#6e7074', '#61a0a8', '#efa18d'],
  ['#dd6b66', '#759aa0', '#e69d87', '#8dc1a9', '#ea7e53', '#eedd78'],
  ['#516b91', '#59c4e6', '#edafda', '#93b7e3', '#a5e7f0', '#cbb0e3'],
  ['#893448', '#d95850', '#eb8146', '#ffb248', '#f2d643', '#ebdba4'],
  ['#4ea397', '#22c3aa', '#7bd9a5', '#d0648a', '#f58db2', '#f2b3c9'],
  ['#3fb1e3', '#6be6c1', '#626c91', '#a0a7e6', '#c4ebad', '#96dee8'],
  ['#fc97af', '#87f7cf', '#f7f494', '#72ccff', '#f7c5a0', '#d4a4eb'],
  ['#c1232b', '#27727b', '#fcce10', '#e87c25', '#b5c334', '#fe8463'],
  ['#2ec7c9', '#b6a2de', '#5ab1ef', '#ffb980', '#d87a80', '#8d98b3'],
  ['#e01f54', '#001852', '#f5e8c8', '#b8d2c7', '#c6b38e', '#a4d8c2'],
  ['#c12e34', '#e6b600', '#0098d9', '#2b821d', '#005eaa', '#339ca8'],
  ['#8a7ca8', '#e098c7', '#8fd3e8', '#71669e', '#cc70af', '#7cb4cc'],
]

const mainStore = useMainStore()
const slidesStore = useSlidesStore()
const { handleElement, handleElementId } = storeToRefs(mainStore)
const { theme } = storeToRefs(slidesStore)

const handleChartElement = handleElement as Ref<PPTChartElement>

const chartDataEditorVisible = ref(false)
const presetThemesVisible = ref(false)
const presetThemeColorHoverIndex = ref<[number, number]>([-1, -1])

const { addHistorySnapshot } = useHistorySnapshot()

const fill = ref<string>('#000')

const themeColor = ref<string[]>([])
const gridColor = ref('')


const lineSmooth = ref(true)
const donut = ref(false)
const stackBars = ref(false)
const textColor = ref('')
const stack = ref(false)
watch(
  handleElement,
  () => {
    if (!handleElement.value || handleElement.value.type !== 'chart') return
    fill.value = handleElement.value.fill || '#fff'

    if (handleElement.value.options) {
      const {
        lineSmooth: _lineSmooth,
        stack: _stack,
      } = handleElement.value.options

      if (_lineSmooth !== undefined) lineSmooth.value = _lineSmooth
      if (_stack !== undefined) stack.value = _stack
    }

    themeColor.value = handleElement.value.themeColor
    textColor.value = handleElement.value.textColor || '#333'
  },
  { deep: true, immediate: true }
)

const updateElement = (props: Partial<PPTChartElement>) => {
  slidesStore.updateElement({ id: handleElementId.value, props })
  addHistorySnapshot()
}

// 设置图表数据
const updateData = (data: ChartData) => {
  chartDataEditorVisible.value = false
  updateElement({ data })
}

// 设置填充色
const updateFill = (value: string) => {
  updateElement({ fill: value })
}

// 设置其他选项：柱状图转条形图、折线图转面积图、折线图转散点图、饼图转环形图、折线图开关平滑曲线
const updateOptions = (optionProps: ChartOptions) => {
  const _handleElement = handleElement.value as PPTChartElement

  const newOptions = { ..._handleElement.options, ...optionProps }
  updateElement({ options: newOptions })
}

// 设置主题色
const updateTheme = (color: string, index: number) => {
  const props = {
    themeColor: themeColor.value.map((c, i) => (i === index ? color : c)),
  }
  updateElement(props)
}

// 添加主题色
const addThemeColor = () => {
  const props = {
    themeColor: [...themeColor.value, theme.value.themeColor],
  }
  updateElement(props)
}

const updateTextColor = (textColor: string) => {
  updateElement({ textColor })
}

// 使用预置主题配色
const applyPresetTheme = (colors: string[], index: number) => {
  const themeColor = colors.slice(0, index + 1)
  updateElement({ themeColor })
  presetThemesVisible.value = false
}

// 删除主题色
const deleteThemeColor = (index: number) => {
  const props = {
    themeColor: themeColor.value.filter((c, i) => i !== index),
  }
  updateElement(props)
}

const openDataEditor = () => (chartDataEditorVisible.value = true)

emitter.on(EmitterEvents.OPEN_CHART_DATA_EDITOR, openDataEditor)
onUnmounted(() => {
  emitter.off(EmitterEvents.OPEN_CHART_DATA_EDITOR, openDataEditor)
})
</script>

<style lang="scss" scoped>
.chart-style-panel {
  user-select: none;
}
.row {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.full-width-btn {
  width: 100%;
}
.btn-icon {
  margin-right: 3px;
}
.color-btn-wrap {
  position: relative;
}
.delete-color-btn {
  position: absolute;
  width: 30px;
  right: 2px;
  top: 2px;
  bottom: 2px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
  cursor: pointer;
}
.preset-themes {
  width: 250px;
  display: flex;
  margin-bottom: -10px;

  @include flex-grid-layout();
}
.preset-theme {
  display: flex;
  cursor: pointer;

  @include flex-grid-layout-children(2, 48%);
}
.preset-theme-color {
  width: 20px;
  height: 20px;

  &.select {
    transform: scale(1.2);
    transition: transform $transitionDelayFast;
  }
}
</style>
