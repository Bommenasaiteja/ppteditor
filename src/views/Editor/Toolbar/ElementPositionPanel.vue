<template>
  <div class="element-positopn-panel">
    <div class="title">Level:</div>
    <ButtonGroup class="row">
      <Button
        style="flex: 1"
        @click="orderElement(handleElement!, ElementOrderCommands.TOP)"
        ><IconSendToBack class="btn-icon" /> pin to top</Button
      >
      <Button
        style="flex: 1"
        @click="orderElement(handleElement!, ElementOrderCommands.BOTTOM)"
        ><IconBringToFrontOne class="btn-icon" /> pin to bottom</Button
      >
    </ButtonGroup>
    <ButtonGroup class="row">
      <Button
        style="flex: 1"
        @click="orderElement(handleElement!, ElementOrderCommands.UP)"
        ><IconBringToFront class="btn-icon" /> Bring to front</Button
      >
      <Button
        style="flex: 1"
        @click="orderElement(handleElement!, ElementOrderCommands.DOWN)"
        ><IconSentToBack class="btn-icon" /> Send to back</Button
      >
    </ButtonGroup>

    <Divider />

    <div class="title">Alignment:</div>
    <ButtonGroup class="row">
      <Button
        style="flex: 1"
        v-tooltip="'left aligned'"
        @click="alignElementToCanvas(ElementAlignCommands.LEFT)"
        ><IconAlignLeft
      /></Button>
      <Button
        style="flex: 1"
        v-tooltip="'Center horizontally'"
        @click="alignElementToCanvas(ElementAlignCommands.HORIZONTAL)"
        ><IconAlignVertically
      /></Button>
      <Button
        style="flex: 1"
        v-tooltip="'Align right'"
        @click="alignElementToCanvas(ElementAlignCommands.RIGHT)"
        ><IconAlignRight
      /></Button>
    </ButtonGroup>
    <ButtonGroup class="row">
      <Button
        style="flex: 1"
        v-tooltip="'Align top'"
        @click="alignElementToCanvas(ElementAlignCommands.TOP)"
        ><IconAlignTop
      /></Button>
      <Button
        style="flex: 1"
        v-tooltip="'Center vertically'"
        @click="alignElementToCanvas(ElementAlignCommands.VERTICAL)"
        ><IconAlignHorizontally
      /></Button>
      <Button
        style="flex: 1"
        v-tooltip="'Align bottom'"
        @click="alignElementToCanvas(ElementAlignCommands.BOTTOM)"
        ><IconAlignBottom
      /></Button>
    </ButtonGroup>

    <Divider />

    <div class="row">
      <NumberInput
        :step="5"
        :value="left"
        @update:value="(value) => updateLeft(value)"
        style="width: 45%"
      >
        <template #prefix> level: </template>
      </NumberInput>
      <div style="width: 10%"></div>
      <NumberInput
        :step="5"
        :value="top"
        @update:value="(value) => updateTop(value)"
        style="width: 45%"
      >
        <template #prefix> vertical: </template>
      </NumberInput>
    </div>

    <template v-if="handleElement!.type !== 'line'">
      <div class="row">
        <NumberInput
          :min="minSize"
          :max="1500"
          :step="5"
          :disabled="isVerticalText"
          :value="width"
          @update:value="(value) => updateWidth(value)"
          style="width: 45%"
        >
          <template #prefix> width: </template>
        </NumberInput>
        <template
          v-if="['image', 'shape', 'audio'].includes(handleElement!.type)"
        >
          <IconLock
            style="width: 10%"
            class="icon-btn"
            v-tooltip="'Unlock aspect ratio'"
            @click="updateFixedRatio(false)"
            v-if="fixedRatio"
          />
          <IconUnlock
            style="width: 10%"
            class="icon-btn"
            v-tooltip="'aspect ratio lock'"
            @click="updateFixedRatio(true)"
            v-else
          />
        </template>
        <div style="width: 10%" v-else></div>
        <NumberInput
          :min="minSize"
          :max="800"
          :step="5"
          :disabled="isHorizontalText || handleElement!.type === 'table'"
          :value="height"
          @update:value="(value) => updateHeight(value)"
          style="width: 45%"
        >
          <template #prefix> high: </template>
        </NumberInput>
      </div>
    </template>

    <template v-if="!['line', 'video', 'audio'].includes(handleElement!.type)">
      <Divider />

      <div class="row">
        <NumberInput
          :min="-180"
          :max="180"
          :step="5"
          :value="rotate"
          @update:value="(value) => updateRotate(value)"
          style="width: 45%"
        >
          <template #prefix> Rotation: </template>
        </NumberInput>
        <div style="width: 7%"></div>
        <div class="text-btn" @click="updateRotate45('-')" style="width: 24%">
          <IconRotate /> -45°
        </div>
        <div class="text-btn" @click="updateRotate45('+')" style="width: 24%">
          <IconRotate :style="{ transform: 'rotateY(180deg)' }" /> +45°
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { round } from 'lodash'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import { ElementAlignCommands, ElementOrderCommands } from '@/types/edit'
import { MIN_SIZE } from '@/configs/element'
import { SHAPE_PATH_FORMULAS } from '@/configs/shapes'
import useOrderElement from '@/hooks/useOrderElement'
import useAlignElementToCanvas from '@/hooks/useAlignElementToCanvas'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'
import Divider from '@/components/Divider.vue'
import Button from '@/components/Button.vue'
import ButtonGroup from '@/components/ButtonGroup.vue'
import NumberInput from '@/components/NumberInput.vue'

const slidesStore = useSlidesStore()
const { handleElement, handleElementId } = storeToRefs(useMainStore())

const left = ref(0)
const top = ref(0)
const width = ref(0)
const height = ref(0)
const rotate = ref(0)
const fixedRatio = ref(false)

const minSize = computed(() => {
  if (!handleElement.value) return 20
  return MIN_SIZE[handleElement.value.type] || 20
})

const isHorizontalText = computed(() => {
  return handleElement.value?.type === 'text' && !handleElement.value.vertical
})
const isVerticalText = computed(() => {
  return handleElement.value?.type === 'text' && handleElement.value.vertical
})

watch(
  handleElement,
  () => {
    if (!handleElement.value) return

    left.value = round(handleElement.value.left, 1)
    top.value = round(handleElement.value.top, 1)

    fixedRatio.value =
      'fixedRatio' in handleElement.value && !!handleElement.value.fixedRatio

    if (handleElement.value.type !== 'line') {
      width.value = round(handleElement.value.width, 1)
      height.value = round(handleElement.value.height, 1)
      rotate.value =
        'rotate' in handleElement.value &&
        handleElement.value.rotate !== undefined
          ? round(handleElement.value.rotate, 1)
          : 0
    }
  },
  { deep: true, immediate: true }
)

const { orderElement } = useOrderElement()
const { alignElementToCanvas } = useAlignElementToCanvas()

const { addHistorySnapshot } = useHistorySnapshot()

// 设置元素位置
const updateLeft = (value: number) => {
  const props = { left: value }
  slidesStore.updateElement({ id: handleElementId.value, props })
  addHistorySnapshot()
}
const updateTop = (value: number) => {
  const props = { top: value }
  slidesStore.updateElement({ id: handleElementId.value, props })
  addHistorySnapshot()
}

// 设置元素宽度、高度、旋转角度
// 对形状设置宽高时，需要检查是否需要更新形状路径
const updateShapePathData = (width: number, height: number) => {
  if (
    handleElement.value &&
    handleElement.value.type === 'shape' &&
    'pathFormula' in handleElement.value &&
    handleElement.value.pathFormula
  ) {
    const pathFormula = SHAPE_PATH_FORMULAS[handleElement.value.pathFormula]

    let path = ''
    if ('editable' in pathFormula)
      path = pathFormula.formula(width, height, handleElement.value.keypoint!)
    else path = pathFormula.formula(width, height)

    return {
      viewBox: [width, height],
      path,
    }
  }
  return null
}
const updateWidth = (value: number) => {
  let props = { width: value }
  const shapePathData = updateShapePathData(value, height.value)
  if (shapePathData) props = { ...props, ...shapePathData }

  slidesStore.updateElement({ id: handleElementId.value, props })
  addHistorySnapshot()
}
const updateHeight = (value: number) => {
  let props = { height: value }
  const shapePathData = updateShapePathData(width.value, value)
  if (shapePathData) props = { ...props, ...shapePathData }

  slidesStore.updateElement({ id: handleElementId.value, props })
  addHistorySnapshot()
}
const updateRotate = (value: number) => {
  const props = { rotate: value }
  slidesStore.updateElement({ id: handleElementId.value, props })
  addHistorySnapshot()
}

// 固定元素的宽高比
const updateFixedRatio = (value: boolean) => {
  const props = { fixedRatio: value }
  slidesStore.updateElement({ id: handleElementId.value, props })
  addHistorySnapshot()
}

// 将元素旋转45度（顺时针或逆时针）
const updateRotate45 = (command: '+' | '-') => {
  let _rotate = Math.floor(rotate.value / 45) * 45
  if (command === '+') _rotate = _rotate + 45
  else if (command === '-') _rotate = _rotate - 45

  if (_rotate < -180) _rotate = -180
  if (_rotate > 180) _rotate = 180

  const props = { rotate: _rotate }
  slidesStore.updateElement({ id: handleElementId.value, props })
  addHistorySnapshot()
}
</script>

<style lang="scss" scoped>
.row {
  width: 100%;
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.title {
  margin-bottom: 10px;
}
.label {
  text-align: center;
}
.btn-icon {
  margin-right: 3px;
}
.icon-btn {
  cursor: pointer;
}
.text-btn {
  height: 30px;
  line-height: 30px;
  text-align: center;
  cursor: pointer;

  &:hover {
    background-color: #efefef;
    border-radius: $borderRadius;
  }
}
</style>
