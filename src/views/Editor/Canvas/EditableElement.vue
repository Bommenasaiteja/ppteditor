<template>
  <div
    class="editable-element"
    ref="elementRef"
    :id="`editable-element-${elementInfo.id}`"
    :style="{
      zIndex: elementIndex,
    }"
  >
    <component
      :is="currentElementComponent"
      :elementInfo="elementInfo"
      :selectElement="selectElement"
      :contextmenus="contextmenus"
    ></component>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { ElementTypes, type PPTElement } from '@/types/slides'
import type { ContextmenuItem } from '@/components/Contextmenu/types'

import useLockElement from '@/hooks/useLockElement'
import useDeleteElement from '@/hooks/useDeleteElement'
import useCombineElement from '@/hooks/useCombineElement'
import useOrderElement from '@/hooks/useOrderElement'
import useAlignElementToCanvas from '@/hooks/useAlignElementToCanvas'
import useCopyAndPasteElement from '@/hooks/useCopyAndPasteElement'
import useSelectAllElement from '@/hooks/useSelectAllElement'

import { ElementOrderCommands, ElementAlignCommands } from '@/types/edit'

import ImageElement from '@/views/components/element/ImageElement/index.vue'
import TextElement from '@/views/components/element/TextElement/index.vue'
import ShapeElement from '@/views/components/element/ShapeElement/index.vue'
import LineElement from '@/views/components/element/LineElement/index.vue'
import ChartElement from '@/views/components/element/ChartElement/index.vue'
import TableElement from '@/views/components/element/TableElement/index.vue'
import LatexElement from '@/views/components/element/LatexElement/index.vue'
import VideoElement from '@/views/components/element/VideoElement/index.vue'
import AudioElement from '@/views/components/element/AudioElement/index.vue'

const props = defineProps<{
  elementInfo: PPTElement
  elementIndex: number
  isMultiSelect: boolean
  selectElement: (
    e: MouseEvent | TouchEvent,
    element: PPTElement,
    canMove?: boolean
  ) => void
  openLinkDialog: () => void
}>()

const currentElementComponent = computed<unknown>(() => {
  const elementTypeMap = {
    [ElementTypes.IMAGE]: ImageElement,
    [ElementTypes.TEXT]: TextElement,
    [ElementTypes.SHAPE]: ShapeElement,
    [ElementTypes.LINE]: LineElement,
    [ElementTypes.CHART]: ChartElement,
    [ElementTypes.TABLE]: TableElement,
    [ElementTypes.LATEX]: LatexElement,
    [ElementTypes.VIDEO]: VideoElement,
    [ElementTypes.AUDIO]: AudioElement,
  }
  return elementTypeMap[props.elementInfo.type] || null
})

const { orderElement } = useOrderElement()
const { alignElementToCanvas } = useAlignElementToCanvas()
const { combineElements, uncombineElements } = useCombineElement()
const { deleteElement } = useDeleteElement()
const { lockElement, unlockElement } = useLockElement()
const { copyElement, pasteElement, cutElement } = useCopyAndPasteElement()
const { selectAllElement } = useSelectAllElement()

const contextmenus = (): ContextmenuItem[] => {
  if (props.elementInfo.lock) {
    return [
      {
        text: 'unlock',
        handler: () => unlockElement(props.elementInfo),
      },
    ]
  }

  return [
    {
      text: 'Cut',
      subText: 'Ctrl + X',
      handler: cutElement,
    },
    {
      text: 'Copy',
      subText: 'Ctrl + C',
      handler: copyElement,
    },
    {
      text: 'Paste',
      subText: 'Ctrl + V',
      handler: pasteElement,
    },
    { divider: true },
    {
      text: 'Horizontal center',
      handler: () => alignElementToCanvas(ElementAlignCommands.HORIZONTAL),
      children: [
        {
          text: 'Horizontal and vertical centering',
          handler: () => alignElementToCanvas(ElementAlignCommands.CENTER),
        },
        {
          text: 'Horizontally centered',
          handler: () => alignElementToCanvas(ElementAlignCommands.HORIZONTAL),
        },
        {
          text: 'Left-aligned',
          handler: () => alignElementToCanvas(ElementAlignCommands.LEFT),
        },
        {
          text: 'right-aligned',
          handler: () => alignElementToCanvas(ElementAlignCommands.RIGHT),
        },
      ],
    },
    {
      text: 'vertically centered',
      handler: () => alignElementToCanvas(ElementAlignCommands.VERTICAL),
      children: [
        {
          text: 'Horizontal and vertical centering',
          handler: () => alignElementToCanvas(ElementAlignCommands.CENTER),
        },
        {
          text: 'Vertically centered',
          handler: () => alignElementToCanvas(ElementAlignCommands.VERTICAL),
        },
        {
          text: 'Align top',
          handler: () => alignElementToCanvas(ElementAlignCommands.TOP),
        },
        {
          text: 'Align bottom',
          handler: () => alignElementToCanvas(ElementAlignCommands.BOTTOM),
        },
      ],
    },
    { divider: true },
    {
      text: 'Send to top',
      disable: props.isMultiSelect && !props.elementInfo.groupId,
      handler: () => orderElement(props.elementInfo, ElementOrderCommands.TOP),
      children: [
        {
          text: 'Put on top',
          handler: () =>
            orderElement(props.elementInfo, ElementOrderCommands.TOP),
        },
        {
          text: 'Move one level up',
          handler: () =>
            orderElement(props.elementInfo, ElementOrderCommands.UP),
        },
      ],
    },
    {
      text: 'Put to bottom',
      disable: props.isMultiSelect && !props.elementInfo.groupId,
      handler: () =>
        orderElement(props.elementInfo, ElementOrderCommands.BOTTOM),
      children: [
        {
          text: 'Put to bottom',
          handler: () =>
            orderElement(props.elementInfo, ElementOrderCommands.BOTTOM),
        },
        {
          text: 'Move one level down',
          handler: () =>
            orderElement(props.elementInfo, ElementOrderCommands.DOWN),
        },
      ],
    },
    { divider: true },
    {
      text: 'Set link',
      handler: props.openLinkDialog,
    },
    {
      text: props.elementInfo.groupId ? 'Ungroup' : 'Group',
      subText: 'Ctrl + G',
      handler: props.elementInfo.groupId ? uncombineElements : combineElements,
      hide: !props.isMultiSelect,
    },
    {
      text: 'Select all',
      subText: 'Ctrl + A',
      handler: selectAllElement,
    },
    {
      text: 'Lock',
      subText: 'Ctrl + L',
      handler: lockElement,
    },
    {
      text: 'delete',
      subText: 'Delete',
      handler: deleteElement,
    },
  ]
}
</script>
