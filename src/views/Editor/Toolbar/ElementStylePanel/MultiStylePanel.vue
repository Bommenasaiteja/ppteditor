<template>
  <div class="multi-style-panel">
    <div class="row">
      <div style="width: 40%">Fill color:</div>
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

    <Divider />

    <div class="row">
      <div style="width: 40%">Border style:</div>
      <Select
        style="width: 60%"
        :value="outline.style || ''"
        @update:value="value => updateOutline({ style: value as 'solid' | 'dashed' })"
        :options="[
          { label: 'solid border', value: 'solid' },
          { label: 'dashed border', value: 'dashed' },
        ]"
      />
    </div>
    <div class="row">
      <div style="width: 40%">Border color:</div>
      <Popover trigger="click" style="width: 60%">
        <template #content>
          <ColorPicker
            :modelValue="outline.color"
            @update:modelValue="(value) => updateOutline({ color: value })"
          />
        </template>
        <ColorButton :color="outline.color || '#000'" />
      </Popover>
    </div>
    <div class="row">
      <div style="width: 40%">Border thickness:</div>
      <NumberInput
        :value="outline.width || 0"
        @update:value="(value) => updateOutline({ width: value })"
        style="width: 60%"
      />
    </div>

    <Divider />

    <SelectGroup class="row">
      <Select
        style="width: 60%"
        :value="richTextAttrs.fontname"
        @update:value="value => updateFontStyle('fontname', value as string)"
        :options="[...availableFonts, ...WEB_FONTS]"
      >
        <template #icon>
          <IconFontSize />
        </template>
      </Select>
      <Select
        style="width: 40%"
        :value="richTextAttrs.fontsize"
        @update:value="value => updateFontStyle('fontsize', value as string)"
        :options="
          fontSizeOptions.map((item) => ({
            label: item,
            value: item,
          }))
        "
      >
        <template #icon>
          <IconAddText />
        </template>
      </Select>
    </SelectGroup>
    <ButtonGroup class="row" passive>
      <Popover trigger="click" style="width: 30%">
        <template #content>
          <ColorPicker
            :modelValue="richTextAttrs.color"
            @update:modelValue="(value) => updateFontStyle('color', value)"
          />
        </template>
        <TextColorButton
          first
          :color="richTextAttrs.color"
          v-tooltip="'text color'"
        >
          <IconText />
        </TextColorButton>
      </Popover>
      <Popover trigger="click" style="width: 30%">
        <template #content>
          <ColorPicker
            :modelValue="richTextAttrs.backcolor"
            @update:modelValue="(value) => updateFontStyle('backcolor', value)"
          />
        </template>
        <TextColorButton
          :color="richTextAttrs.backcolor"
          v-tooltip="'text highlight'"
        >
          <IconHighLight />
        </TextColorButton>
      </Popover>
      <Button
        class="font-size-btn"
        style="width: 20%"
        v-tooltip="'Increase font size'"
        @click="updateFontStyle('fontsize-add', '2')"
        ><IconFontSize />+</Button
      >
      <Button
        last
        class="font-size-btn"
        style="width: 20%"
        v-tooltip="'Reduce font size'"
        @click="updateFontStyle('fontsize-reduce', '2')"
        ><IconFontSize />-</Button
      >
    </ButtonGroup>
    <RadioGroup
      class="row"
      button-style="solid"
      :value="richTextAttrs.align"
      @update:value="(value) => updateFontStyle('align', value)"
    >
      <RadioButton value="left" style="flex: 1" v-tooltip="'Left-aligned'"
        ><IconAlignTextLeft
      /></RadioButton>
      <RadioButton value="center" style="flex: 1" v-tooltip="'center'"
        ><IconAlignTextCenter
      /></RadioButton>
      <RadioButton value="right" style="flex: 1" v-tooltip="'right-aligned'"
        ><IconAlignTextRight
      /></RadioButton>
    </RadioGroup>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import type { PPTElement, PPTElementOutline, TableCell } from '@/types/slides'
import emitter, { EmitterEvents } from '@/utils/emitter'
import { WEB_FONTS } from '@/configs/font'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

import ColorButton from '../common/ColorButton.vue'
import TextColorButton from '../common/TextColorButton.vue'
import ColorPicker from '@/components/ColorPicker/index.vue'
import Divider from '@/components/Divider.vue'
import Button from '@/components/Button.vue'
import ButtonGroup from '@/components/ButtonGroup.vue'
import RadioButton from '@/components/RadioButton.vue'
import RadioGroup from '@/components/RadioGroup.vue'
import NumberInput from '@/components/NumberInput.vue'
import Select from '@/components/Select.vue'
import SelectGroup from '@/components/SelectGroup.vue'
import Popover from '@/components/Popover.vue'

const slidesStore = useSlidesStore()
const { richTextAttrs, availableFonts, activeElementList } = storeToRefs(
  useMainStore()
)

const { addHistorySnapshot } = useHistorySnapshot()

const updateElement = (id: string, props: Partial<PPTElement>) => {
  slidesStore.updateElement({ id, props })
  addHistorySnapshot()
}

const fontSizeOptions = [
  '12px',
  '14px',
  '16px',
  '18px',
  '20px',
  '22px',
  '24px',
  '28px',
  '32px',
  '36px',
  '40px',
  '44px',
  '48px',
  '54px',
  '60px',
  '66px',
  '72px',
  '76px',
  '80px',
  '88px',
  '96px',
  '104px',
  '112px',
  '120px',
]

const fill = ref('#fff')
const outline = ref<PPTElementOutline>({
  width: 0,
  color: '#fff',
  style: 'solid',
})

// 批量修改填充色（表格元素为单元格填充、音频元素为图标颜色）
const updateFill = (value: string) => {
  for (const el of activeElementList.value) {
    if (el.type === 'text' || el.type === 'shape' || el.type === 'chart')
      updateElement(el.id, { fill: value })

    if (el.type === 'table') {
      const data: TableCell[][] = JSON.parse(JSON.stringify(el.data))
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
          const style = data[i][j].style || {}
          data[i][j].style = { ...style, backcolor: value }
        }
      }
      updateElement(el.id, { data })
    }

    if (el.type === 'audio') updateElement(el.id, { color: value })
  }
  fill.value = value
}

// 修改边框/线条样式
const updateOutline = (outlineProps: Partial<PPTElementOutline>) => {
  for (const el of activeElementList.value) {
    if (
      el.type === 'text' ||
      el.type === 'image' ||
      el.type === 'shape' ||
      el.type === 'table' ||
      el.type === 'chart'
    ) {
      const outline = el.outline || { width: 2, color: '#000', style: 'solid' }
      const props = { outline: { ...outline, ...outlineProps } }
      updateElement(el.id, props)
    }

    if (el.type === 'line') updateElement(el.id, outlineProps)
  }
  outline.value = { ...outline.value, ...outlineProps }
}

// 修改文字样式
const updateFontStyle = (command: string, value: string) => {
  for (const el of activeElementList.value) {
    console.log('entred here')
    if (el.type === 'text' || (el.type === 'shape' && el.text?.content)) {
      
      emitter.emit(EmitterEvents.RICH_TEXT_COMMAND, {
        target: el.id,
        action: { command, value },
      })
    }
    if (el.type === 'table') {
      const data: TableCell[][] = JSON.parse(JSON.stringify(el.data))
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
          const style = data[i][j].style || {}
          data[i][j].style = { ...style, [command]: value }
        }
      }
      updateElement(el.id, { data })
    }
    if (el.type === 'latex' && command === 'color') {
      updateElement(el.id, { color: value })
    }
  }
}
</script>

<style lang="scss" scoped>
.row {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.font-size-btn {
  padding: 0;
}
</style>
