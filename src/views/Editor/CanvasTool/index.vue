<template>
  <div class="canvas-tool">
    <div class="left-handler">
      <IconBack
        class="handler-item"
        :class="{ disable: !canUndo }"
        v-tooltip="'Undo'"
        @click="undo()"
      />
      <IconNext
        class="handler-item"
        :class="{ disable: !canRedo }"
        v-tooltip="'Redo'"
        @click="redo()"
      />
      <Divider type="vertical" style="height: 20px" />
      <IconMoveOne
        class="handler-item"
        :class="{ active: showSelectPanel }"
        v-tooltip="'SelectPanel'"
        @click="toggleSelectPanel()"
      />
      <IconSearch
        class="handler-item"
        :class="{ active: showSearchPanel }"
        v-tooltip="'Find/Replace'"
        @click="toggleSraechPanel()"
      />
    </div>

    <div class="add-element-handler">
      <div class="handler-item group-btn" v-tooltip="'Insert Text'">
        <IconFontSize
          class="icon"
          :class="{ active: creatingElement?.type === 'text' }"
          @click="drawText()"
        />

        <Popover
          trigger="click"
          v-model:value="textTypeSelectVisible"
          style="height: 100%"
        >
          <template #content>
            <PopoverMenuItem
              center
              @click="
                () => {
                  drawText()
                  textTypeSelectVisible = false
                }
              "
              ><IconTextRotationNone /> Horizontal text box</PopoverMenuItem
            >
            <PopoverMenuItem
              center
              @click="
                () => {
                  drawText(true)
                  textTypeSelectVisible = false
                }
              "
              ><IconTextRotationDown /> vertical text box</PopoverMenuItem
            >
          </template>
          <IconDown class="arrow" />
        </Popover>
      </div>
      <FileInput @change="(files) => insertImageElement(files)">
        <IconPicture class="handler-item" v-tooltip="'Insert picture'" />
      </FileInput>
      <Popover trigger="click" v-model:value="shapePoolVisible">
        <template #content>
          <ShapePool @select="(shape) => drawShape(shape)" />
        </template>
        <IconGraphicDesign
          class="handler-item"
          :class="{
            active: creatingCustomShape || creatingElement?.type === 'shape',
          }"
          v-tooltip="'Insert shape'"
        />
      </Popover>
      <Popover trigger="click" v-model:value="linePoolVisible">
        <template #content>
          <LinePool @select="(line) => drawLine(line)" />
        </template>
        <IconConnection
          class="handler-item"
          :class="{ active: creatingElement?.type === 'line' }"
          v-tooltip="'Insert line'"
        />
      </Popover>
      <Popover trigger="click" v-model:value="chartPoolVisible">
        <template #content>
          <ChartPool
            @select="
              (chart) => {
                createChartElement(chart)
                chartPoolVisible = false
              }
            "
          />
        </template>
        <IconChartProportion class="handler-item" v-tooltip="'Insert chart'" />
      </Popover>
      <Popover trigger="click" v-model:value="tableGeneratorVisible">
        <template #content>
          <TableGenerator
            @close="tableGeneratorVisible = false"
            @insert="
              ({ row, col }) => {
                createTableElement(row, col)
                tableGeneratorVisible = false
              }
            "
          />
        </template>
        <IconInsertTable class="handler-item" v-tooltip="'Insert table'" />
      </Popover>
      <IconFormula
        class="handler-item"
        v-tooltip="'Insert formula'"
        @click="latexEditorVisible = true"
      />
      <Popover trigger="click" v-model:value="mediaInputVisible">
        <template #content>
          <MediaInput
            @close="mediaInputVisible = false"
            @insertVideo="
              (src) => {
                createVideoElement(src)
                mediaInputVisible = false
              }
            "
            @insertAudio="
              (src) => {
                createAudioElement(src)
                mediaInputVisible = false
              }
            "
          />
        </template>
        <IconVideoTwo
          class="handler-item"
          v-tooltip="'Insert audio and video'"
        />
      </Popover>
    </div>

    <div class="right-handler">
      <IconMinus class="handler-item viewport-size" @click="scaleCanvas('-')" />
      <Popover trigger="click" v-model:value="canvasScaleVisible">
        <template #content>
          <PopoverMenuItem
            center
            v-for="item in canvasScalePresetList"
            :key="item"
            @click="applyCanvasPresetScale(item)"
            >{{ item }}%</PopoverMenuItem
          >
        </template>
        <span class="text">{{ canvasScalePercentage }}</span>
      </Popover>
      <IconPlus class="handler-item viewport-size" @click="scaleCanvas('+')" />
      <IconFullScreen
        class="handler-item viewport-size-adaptation"
        v-tooltip="'Adapt to screen'"
        @click="resetCanvas()"
      />
    </div>

    <Modal v-model:visible="latexEditorVisible" :width="880">
      <LaTeXEditor
        @close="latexEditorVisible = false"
        @update="
          (data) => {
            createLatexElement(data)
            latexEditorVisible = false
          }
        "
      />
    </Modal>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useSnapshotStore } from '@/store'
import { getImageDataURL } from '@/utils/image'
import type { ShapePoolItem } from '@/configs/shapes'
import type { LinePoolItem } from '@/configs/lines'
import useScaleCanvas from '@/hooks/useScaleCanvas'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'
import useCreateElement from '@/hooks/useCreateElement'

import ShapePool from './ShapePool.vue'
import LinePool from './LinePool.vue'
import ChartPool from './ChartPool.vue'
import TableGenerator from './TableGenerator.vue'
import MediaInput from './MediaInput.vue'
import LaTeXEditor from '@/components/LaTeXEditor/index.vue'
import FileInput from '@/components/FileInput.vue'
import Modal from '@/components/Modal.vue'
import Divider from '@/components/Divider.vue'
import Popover from '@/components/Popover.vue'
import PopoverMenuItem from '@/components/PopoverMenuItem.vue'

const mainStore = useMainStore()
const {
  creatingElement,
  creatingCustomShape,
  showSelectPanel,
  showSearchPanel,
} = storeToRefs(mainStore)
const { canUndo, canRedo } = storeToRefs(useSnapshotStore())

const { redo, undo } = useHistorySnapshot()

const {
  scaleCanvas,
  setCanvasScalePercentage,
  resetCanvas,
  canvasScalePercentage,
} = useScaleCanvas()

const canvasScalePresetList = [200, 150, 100, 80, 50]
const canvasScaleVisible = ref(false)

const applyCanvasPresetScale = (value: number) => {
  setCanvasScalePercentage(value)
  canvasScaleVisible.value = false
}

const {
  createImageElement,
  createChartElement,
  createTableElement,
  createLatexElement,
  createVideoElement,
  createAudioElement,
} = useCreateElement()

const insertImageElement = (files: FileList) => {
  const imageFile = files[0]
  if (!imageFile) return
  getImageDataURL(imageFile).then((dataURL) => createImageElement(dataURL))
}

const shapePoolVisible = ref(false)
const linePoolVisible = ref(false)
const chartPoolVisible = ref(false)
const tableGeneratorVisible = ref(false)
const mediaInputVisible = ref(false)
const latexEditorVisible = ref(false)
const textTypeSelectVisible = ref(false)

// 绘制文字范围
const drawText = (vertical = false) => {
  mainStore.setCreatingElement({
    type: 'text',
    vertical,
  })
}

// 绘制形状范围（或绘制自定义任意多边形）
const drawShape = (shape: ShapePoolItem) => {
  if (shape.title === 'arbitrary polygon') {
    mainStore.setCreatingCustomShapeState(true)
  } else {
    mainStore.setCreatingElement({
      type: 'shape',
      data: shape,
    })
  }
  shapePoolVisible.value = false
}

// 绘制线条路径
const drawLine = (line: LinePoolItem) => {
  mainStore.setCreatingElement({
    type: 'line',
    data: line,
  })
  linePoolVisible.value = false
}

// 打开选择面板
const toggleSelectPanel = () => {
  mainStore.setSelectPanelState(!showSelectPanel.value)
}

// 打开搜索替换面板
const toggleSraechPanel = () => {
  mainStore.setSearchPanelState(!showSearchPanel.value)
}
</script>

<style lang="scss" scoped>
.canvas-tool {
  position: relative;
  border-bottom: 1px solid #808080;
  background-color: #0000;
  color: #000;;
  display: flex;
  justify-content: space-between;
  padding: 0 10px;
  font-size: 13px;
  user-select: none;
}
.left-handler {
  display: flex;
  align-items: center;
}
.add-element-handler {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;

  .handler-item {
    width: 32px;

    &:not(.group-btn):hover {
      color: #52B394;
    }

    &.active {
      color: #52B394;
    }

    &.group-btn {
      width: auto;
      margin-right: 4px;

      &:hover {
        color: #52B394;
      }

      .icon,
      .arrow {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .icon {
        width: 26px;
        padding: 0 2px;

        &:hover {
          color: #52B394;
        }
        &.active {
          color:  #52B394;
        }
      }
      .arrow {
        font-size: 14px;

        &:hover {
          color: #52B394;
        }
      }
    }
  }
}
.handler-item {
  height: 24px;
  font-size: 20px;
  margin: 0 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: $borderRadius;
  overflow: hidden;
  cursor: pointer;

  &.disable {
    opacity: 0.5;
  }
}
.left-handler,
.right-handler {
  .handler-item {
    padding: 0 8px;

    &.active,
    &:not(.disable):hover {
      color: #52B394;
    }
  }
}
.right-handler {
  display: flex;
  align-items: center;

  .text {
    display: inline-block;
    width: 40px;
    text-align: center;
    cursor: pointer;
  }

  .viewport-size {
    font-size: 13px;
  }
}

@media screen and (width <= 1024px) {
  .text {
    display: none;
  }
}
@media screen and (width <= 1000px) {
  .left-handler,
  .right-handler {
    display: none;
  }
}
</style>
