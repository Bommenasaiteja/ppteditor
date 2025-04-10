<template>
  <div
    class="thumbnails"
    @mousedown="() => setThumbnailsFocus(true)"
    v-click-outside="() => setThumbnailsFocus(false)"
    v-contextmenu="contextmenusThumbnails"
  >
    <div class="add-slide">
      <div class="btn" @click="createSlide()">
        <IconPlus class="icon" />Add slides
      </div>
      <Popover
        trigger="click"
        placement="bottom-start"
        v-model:value="presetLayoutPopoverVisible"
        center
      >
        <template #content>
          <LayoutPool
            @select="
              (slide) => {
                createSlideByTemplate(slide)
                presetLayoutPopoverVisible = false
              }
            "
          />
        </template>
        <div class="select-btn"><IconDown /></div>
      </Popover>
    </div>

    <Draggable
      class="thumbnail-list"
      ref="thumbnailsRef"
      :modelValue="slides"
      :animation="200"
      :scroll="true"
      :scrollSensitivity="50"
      @end="handleDragEnd"
      itemKey="id"
    >
      <template #item="{ element, index }">
        <div
          class="thumbnail-item"
          :class="{
            active: slideIndex === index,
            selected: selectedSlidesIndex.includes(index),
          }"
          @mousedown="($event) => handleClickSlideThumbnail($event, index)"
          @dblclick="enterScreening()"
          v-contextmenu="contextmenusThumbnailItem"
        >
          <div class="label" :class="{ 'offset-left': index >= 99 }">
            {{ fillDigit(index + 1, 2) }}
          </div>
          <ThumbnailSlide
            class="thumbnail"
            :slide="element"
            :size="120"
            :visible="index < slidesLoadLimit"
          />
        </div>
      </template>
    </Draggable>

    <div class="page-number">
      slideshow {{ slideIndex + 1 }} / {{ slides.length }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore, useKeyboardStore } from '@/store'
import { fillDigit } from '@/utils/common'
import { isElementInViewport } from '@/utils/element'
import type { ContextmenuItem } from '@/components/Contextmenu/types'
import useSlideHandler from '@/hooks/useSlideHandler'
import useScreening from '@/hooks/useScreening'
import useLoadSlides from '@/hooks/useLoadSlides'

import ThumbnailSlide from '@/views/components/ThumbnailSlide/index.vue'
import LayoutPool from './LayoutPool.vue'
import Popover from '@/components/Popover.vue'
import Draggable from 'vuedraggable'

const mainStore = useMainStore()
const slidesStore = useSlidesStore()
const keyboardStore = useKeyboardStore()
const { selectedSlidesIndex: _selectedSlidesIndex, thumbnailsFocus } =
  storeToRefs(mainStore)
const { slides, slideIndex } = storeToRefs(slidesStore)
const { ctrlKeyState, shiftKeyState } = storeToRefs(keyboardStore)

const { slidesLoadLimit } = useLoadSlides()

const selectedSlidesIndex = computed(() => [
  ..._selectedSlidesIndex.value,
  slideIndex.value,
])

const presetLayoutPopoverVisible = ref(false)

const {
  copySlide,
  pasteSlide,
  createSlide,
  createSlideByTemplate,
  copyAndPasteSlide,
  deleteSlide,
  cutSlide,
  selectAllSlide,
  sortSlides,
} = useSlideHandler()

// 页面被切换时
const thumbnailsRef = ref<InstanceType<typeof Draggable>>()
watch(
  () => slideIndex.value,
  () => {
    // 清除多选状态的幻灯片
    if (selectedSlidesIndex.value.length) {
      mainStore.updateSelectedSlidesIndex([])
    }

    // 检查当前页缩略图是否在可视范围，不在的话需要滚动到对应的位置
    nextTick(() => {
      const activeThumbnailRef: HTMLElement =
        thumbnailsRef.value?.$el?.querySelector('.thumbnail-item.active')
      if (
        thumbnailsRef.value &&
        activeThumbnailRef &&
        !isElementInViewport(activeThumbnailRef, thumbnailsRef.value.$el)
      ) {
        setTimeout(() => {
          activeThumbnailRef.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      }
    })
  }
)

// 切换页面
const changeSlideIndex = (index: number) => {
  mainStore.setActiveElementIdList([])

  if (slideIndex.value === index) return
  slidesStore.updateSlideIndex(index)
}

// 点击缩略图
const handleClickSlideThumbnail = (e: MouseEvent, index: number) => {
  const isMultiSelected = selectedSlidesIndex.value.length > 1

  if (
    isMultiSelected &&
    selectedSlidesIndex.value.includes(index) &&
    e.button !== 0
  )
    return

  // 按住Ctrl键，点选幻灯片，再次点击已选中的页面则取消选中
  // 如果被取消选中的页面刚好是当前激活页面，则需要从其他被选中的页面中选择第一个作为当前激活页面
  if (ctrlKeyState.value) {
    if (slideIndex.value === index) {
      if (!isMultiSelected) return

      const newSelectedSlidesIndex = selectedSlidesIndex.value.filter(
        (item) => item !== index
      )
      mainStore.updateSelectedSlidesIndex(newSelectedSlidesIndex)
      changeSlideIndex(selectedSlidesIndex.value[0])
    } else {
      if (selectedSlidesIndex.value.includes(index)) {
        const newSelectedSlidesIndex = selectedSlidesIndex.value.filter(
          (item) => item !== index
        )
        mainStore.updateSelectedSlidesIndex(newSelectedSlidesIndex)
      } else {
        const newSelectedSlidesIndex = [...selectedSlidesIndex.value, index]
        mainStore.updateSelectedSlidesIndex(newSelectedSlidesIndex)
      }
    }
  }
  // 按住Shift键，选择范围内的全部幻灯片
  else if (shiftKeyState.value) {
    if (slideIndex.value === index && !isMultiSelected) return

    let minIndex = Math.min(...selectedSlidesIndex.value)
    let maxIndex = index

    if (index < minIndex) {
      maxIndex = Math.max(...selectedSlidesIndex.value)
      minIndex = index
    }

    const newSelectedSlidesIndex = []
    for (let i = minIndex; i <= maxIndex; i++) newSelectedSlidesIndex.push(i)
    mainStore.updateSelectedSlidesIndex(newSelectedSlidesIndex)
  }
  // 正常切换页面
  else {
    mainStore.updateSelectedSlidesIndex([])
    changeSlideIndex(index)
  }
}

// 设置缩略图工具栏聚焦状态（只有聚焦状态下，该部分的快捷键才能生效）
const setThumbnailsFocus = (focus: boolean) => {
  if (thumbnailsFocus.value === focus) return
  mainStore.setThumbnailsFocus(focus)

  if (!focus) mainStore.updateSelectedSlidesIndex([])
}

// 拖拽调整顺序后进行数据的同步
const handleDragEnd = (eventData: { newIndex: number; oldIndex: number }) => {
  const { newIndex, oldIndex } = eventData
  if (newIndex === undefined || oldIndex === undefined || newIndex === oldIndex)
    return
  sortSlides(newIndex, oldIndex)
}

const { enterScreening, enterScreeningFromStart } = useScreening()

const contextmenusThumbnails = (): ContextmenuItem[] => {
  return [
    {
      text: 'Paste',
      subText: 'Ctrl + V',
      handler: pasteSlide,
    },
    {
      text: 'Select all',
      subText: 'Ctrl + A',
      handler: selectAllSlide,
    },
    {
      text: 'New page',
      subText: 'Enter',
      handler: createSlide,
    },
    {
      text: 'Slide show',
      subText: 'F5',
      handler: enterScreeningFromStart,
    },
  ]
}

const contextmenusThumbnailItem = (): ContextmenuItem[] => {
  return [
    {
      text: 'Cut',
      subText: 'Ctrl + X',
      handler: cutSlide,
    },
    {
      text: 'Copy',
      subText: 'Ctrl + C',
      handler: copySlide,
    },
    {
      text: 'Paste',
      subText: 'Ctrl + V',
      handler: pasteSlide,
    },
    {
      text: 'Select all',
      subText: 'Ctrl + A',
      handler: selectAllSlide,
    },
    { divider: true },
    {
      text: 'New page',
      subText: 'Enter',
      handler: createSlide,
    },
    {
      text: 'Copy page',
      subText: 'Ctrl + D',
      handler: copyAndPasteSlide,
    },
    {
      text: 'Delete page',
      subText: 'Delete',
      handler: () => deleteSlide(),
    },
    { divider: true },
    {
      text: 'Show from current',
      subText: 'Shift + F5',
      handler: enterScreening,
    },
  ]
}
</script>

<style lang="scss" scoped>
.thumbnails {
  // border-right: solid 1px #808080;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  user-select: none;
}
.add-slide {
  height: 56px;
  font-size: 14px;
  display: flex;
  flex-shrink: 0;
  border-bottom: 1px solid #999999;
  cursor: pointer;
  background-color: #fff;
  color: #000;

  .btn {
    flex: 1;
    font-weight: 500;
    display: flex;
    justify-content: center;
    align-items: center;

    &:hover {
      background-color: #52B394;
      color: #fff;
    }
  }
  .select-btn {
    width: 30px;
    height: 100%;
    display: flex;
    font-size: large;
    justify-content: center;
    align-items: center;
  
    &:hover {
      background-color: #52B394;
    }
  }

  .icon {
    margin-right: 3px;
    font-size: 14px;
  }
}
.thumbnail-list {
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #52B394;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #419478;
  }
  padding: 5px 0;
  flex: 1;
  overflow: auto;
  --tw-bg-opacity: 1;
  background-color: #fff;
}
.thumbnail-item {
  display: flex;
  flex-direction: column-reverse;
  justify-content: center;
  align-items: center;
  padding: 5px 0;
  gap: 5px;
  .thumbnail {
    border-radius: 8px;
    outline: 1px solid grey;
  }

  &.active {
    .label {
      color: #52B394;
    }
    .thumbnail {
      outline: 2px solid #52B394;
    }
  }
  &.selected {
    .thumbnail {
      outline-color: #52B394;
    }
  }
}
.label {
  font-size: 12px;
  font-weight: bold;
  color: #000;
  text-align: center;
  width: 20px;
  cursor: grab;
  margin-top: 4px;

  &.offset-left {
    position: relative;
    left: -4px;
  }

  &:active {
    cursor: grabbing;
  }
}
.page-number {
  height: 40px;
  font-size: 12px;
  border-top: 1px solid #808080;
  line-height: 40px;
  text-align: center;
  color: #000;
  --tw-bg-opacity: 1;
    background-color: #fff;
  
}
</style>
