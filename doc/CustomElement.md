## How to customize an element

Let’s take [Web Page Element] as an example to sort out the process of customizing an element.

> The complete code is at https://github.com/pipipi-pikachu/Paperport/tree/document-demo

### Write the structure and configuration of new elements

First you need to define the structure of this element and add the element type

```typescript
// types/slides.ts

export const enum ElementTypes {
  TEXT = 'text',
  IMAGE = 'image',
  SHAPE = 'shape',
  LINE = 'line',
  CHART = 'chart',
  TABLE = 'table',
  LATEX = 'latex',
  VIDEO = 'video',
  AUDIO = 'audio',
  FRAME = 'frame', // add
}

// add
export interface PPTFrameElement extends PPTBaseElement {
  type: 'frame'
  id: string
  left: number
  top: number
  width: number
  height: number
  url: string //Web page link address
}

//Modify PPTElement Type
export type PPTElement =
  | PPTTextElement
  | PPTImageElement
  | PPTShapeElement
  | PPTLineElement
  | PPTChartElement
  | PPTTableElement
  | PPTLatexElement
  | PPTVideoElement
  | PPTAudioElement
  | PPTFrameElement
```

Add the Chinese name of the new element in the configuration file, as well as the minimum size:

```typescript
//configs/element

export const ELEMENT_TYPE_ZH = {
  text: 'text',
  image: 'picture',
  shape: 'shape',
  line: 'line',
  chart: 'chart',
  table: 'table',
  video: 'video',
  audio: 'audio',
  frame: 'webpage', // add
}

export const MIN_SIZE = {
  text: 20,
  image: 20,
  shape: 15,
  chart: 200,
  table: 20,
  video: 250,
  audio: 20,
  frame: 200, // add
}
```

###Write a new element component
Then start writing the component of that element:

```html
<!-- views/components/element/FrameElement/index.vue -->

<template>
  <div
    class="editable-element-frame"
    :style="{
       top: elementInfo.top + 'px',
       left: elementInfo.left + 'px',
       width: elementInfo.width + 'px',
       height: elementInfo.height + 'px',
     }"
  >
    <div
      class="rotate-wrapper"
      :style="{ transform: `rotate(${elementInfo.rotate}deg)` }"
    >
      <div
        class="element-content"
        v-contextmenu="contextmenus"
        @mousedown="$event => handleSelectElement($event)"
        @touchstart="$event => handleSelectElement($event)"
      >
        <iframe
          :src="elementInfo.url"
          :width="elementInfo.width"
          :height="elementInfo.height"
          :frameborder="0"
          :allowfullscreen="true"
        ></iframe>

        <div class="drag-handler top"></div>
        <div class="drag-handler bottom"></div>
        <div class="drag-handler left"></div>
        <div class="drag-handler right"></div>

        <div
          class="mask"
          v-if="handleElementId !== elementInfo.id"
          @mousedown="$event => handleSelectElement($event, false)"
          @touchstart="$event => handleSelectElement($event, false)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { PropType } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useMainStore } from '@/store'
  import { PPTFrameElement } from '@/types/slides'
  import { ContextmenuItem } from '@/components/Contextmenu/types'

  const props = defineProps({
    elementInfo: {
      type: Object as PropType<PPTFrameElement>,
      required: true,
    },
    selectElement: {
      type: Function as PropType<
        (
          e: MouseEvent | TouchEvent,
          element: PPTFrameElement,
          canMove?: boolean
        ) => void
      >,
      required: true,
    },
    contextmenus: {
      type: Function as PropType<() => ContextmenuItem[] | null>,
    },
  })

  const { handleElementId } = storeToRefs(useMainStore())

  const handleSelectElement = (e: MouseEvent | TouchEvent, canMove = true) => {
    e.stopPropagation()
    props.selectElement(e, props.elementInfo, canMove)
  }
</script>

<style lang="scss" scoped>
  .editable-element-frame {
    position: absolute;
  }
  .element-content {
    width: 100%;
    height: 100%;
    cursor: move;
  }
  .drag-handler {
    position: absolute;

    &.top {
      height: 20px;
      left: 0;
      right: 0;
      top: 0;
    }
    &.bottom {
      height: 20px;
      left: 0;
      right: 0;
      bottom: 0;
    }
    &.left {
      width: 20px;
      top: 0;
      bottom: 0;
      left: 0;
    }
    &.right {
      width: 20px;
      top: 0;
      bottom: 0;
      right: 0;
    }
  }
  .mask {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
</style>
```

In addition, we need another basic component without editing functions for display in thumbnail/show mode:

```html
<!-- views/components/element/FrameElement/BaseFrameElement.vue -->

<template>
  <div
    class="base-element-frame"
    :style="{
       top: elementInfo.top + 'px',
       left: elementInfo.left + 'px',
       width: elementInfo.width + 'px',
       height: elementInfo.height + 'px',
     }"
  >
    <div
      class="rotate-wrapper"
      :style="{ transform: `rotate(${elementInfo.rotate}deg)` }"
    >
      <div class="element-content">
        <iframe
          :src="elementInfo.url"
          :width="elementInfo.width"
          :height="elementInfo.height"
          :frameborder="0"
          :allowfullscreen="true"
        ></iframe>

        <div class="mask"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { PropType } from 'vue'
  import { PPTFrameElement } from '@/types/slides'

  const props = defineProps({
    elementInfo: {
      type: Object as PropType<PPTFrameElement>,
      required: true,
    },
  })
</script>

<style lang="scss" scoped>
  .base-element-frame {
    position: absolute;
  }
  .element-content {
    width: 100%;
    height: 100%;
  }
  .mask {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }
</style>
```

Here you may find that these two components are very similar. Indeed, for relatively simple element components, the editable version and the non-editable version are highly consistent, and the non-editable version may just lack some methods. But for more complex element components, the difference between the two will be relatively large (specifically, you can compare the two versions of text elements and picture elements). Therefore, you can judge by yourself whether to merge the two and abstract them into one component. There are not too many details here. Expand.

After writing the element component, we need to use it where needed, which may include:

- Thumbnail element component `views/components/ThumbnailSlide/ThumbnailElement.vue`
- Screen element component `views/Screen/ScreenElement.vue`
- Editable element component `views/Editor/Canvas/EditableElement.vue`
- Mobile editable element component `views/Mobile/MobileEditor/MobileEditableElement.vue`

Generally speaking, the first two use the non-editable version, and the latter two use the editable version.
Here we only take the editable element component in the canvas as an example:

```html
<!-- views/Editor/Canvas/EditableElement.vue -->

<script lang="ts" setup>
  import FrameElement from '@/views/components/element/FrameElement/index.vue'

  const currentElementComponent = computed(() => {
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
      [ElementTypes.FRAME]: FrameElement, // add
    }
    return elementTypeMap[props.elementInfo.type] || null
  })
</script>
```

In the editable elements of the canvas, you also need to add an operation node `Operate` for the element (generally including eight zoom points, four edges, and one rotation point). For special elements (such as lines, the operation nodes are obviously different from others) you You can write this component yourself, but in general, you can directly use the already written general operation node:

```html
<!-- src\views\Editor\Canvas\Operate\index.vue -->

<script lang="ts" setup>
  const currentOperateComponent = computed(() => {
    const elementTypeMap = {
      [ElementTypes.IMAGE]: ImageElementOperate,
      [ElementTypes.TEXT]: TextElementOperate,
      [ElementTypes.SHAPE]: ShapeElementOperate,
      [ElementTypes.LINE]: LineElementOperate,
      [ElementTypes.TABLE]: TableElementOperate,
      [ElementTypes.CHART]: CommonElementOperate,
      [ElementTypes.LATEX]: CommonElementOperate,
      [ElementTypes.VIDEO]: CommonElementOperate,
      [ElementTypes.AUDIO]: CommonElementOperate,
      [ElementTypes.FRAME]: CommonElementOperate, // add
    }
    return elementTypeMap[props.elementInfo.type] || null
  })
</script>
```

### Write the element editing panel on the right

Next you need to add a style panel to the element. When an element is selected, the right toolbar will automatically focus on this panel. You need to add some settings here that you think are needed to operate the element itself. Just remember one thing: modifying an element actually modifies the element's data, that is Each field in the structure initially defined.
Also, don’t forget to add the action to the history after modifying an element.

```html
<!-- src\views\Editor\Toolbar\ElementStylePanel\FrameStylePanel.vue -->

<template>
  <div class="frame-style-panel">
    <div class="row">
      <div>Web link:</div>
      <input v-model:value="url" placeholder="Please enter the web link" />
      <button @click="updateURL()">OK</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useMainStore, useSlidesStore } from '@/store'
  import useHistorySnapshot from '@/hooks/useHistorySnapshot'

  const slidesStore = useSlidesStore()
  const { handleElementId } = storeToRefs(useMainStore())

  const { addHistorySnapshot } = useHistorySnapshot()

  const url = ref('')

  const updateURL = () => {
    if (!handleElementId.value) return
    slidesStore.updateElement({
      id: handleElementId.value,
      props: { url: url.value },
    })
    addHistorySnapshot()
  }
</script>
```

```html
<script lang="ts" setup>
  import FrameStylePanel from './FrameStylePanel.vue'

  const panelMap = {
    [ElementTypes.TEXT]: TextStylePanel,
    [ElementTypes.IMAGE]: ImageStylePanel,
    [ElementTypes.SHAPE]: ShapeStylePanel,
    [ElementTypes.LINE]: LineStylePanel,
    [ElementTypes.CHART]: ChartStylePanel,
    [ElementTypes.TABLE]: TableStylePanel,
    [ElementTypes.LATEX]: LatexStylePanel,
    [ElementTypes.VIDEO]: VideoStylePanel,
    [ElementTypes.AUDIO]: AudioStylePanel,
    [ElementTypes.FRAME]: FrameStylePanel, // add
  }
</script>
```

### Create elements

This is the final step in customizing a new element. First write a method to create an element:

```typescript
// src\hooks\useCreateElement.ts

const createFrameElement = (url: string) => {
  createElement({
    type: 'frame',
    id: nanoid(10),
    width: 800,
    height: 480,
    rotate: 0,
    left: (VIEWPORT_SIZE - 800) / 2,
    top: (VIEWPORT_SIZE * viewportRatio.value - 480) / 2,
    url,
  })
}
```

Then in the insert toolbar use:

```html
<!-- src\views\Editor\CanvasTool\index.vue -->

<template>
  <div class="canvas-tool">
    <div class="add-element-handler">
      <!-- add -->
      <span
        class="handler-item"
        @click="createFrameElement('https://v3.cn.vuejs.org/')"
        >Insert web page</span
      >
    </div>
  </div>
</template>

<script lang="ts" setup>
  const {
    createImageElement,
    createChartElement,
    createTableElement,
    createLatexElement,
    createVideoElement,
    createAudioElement,
    createFrameElement, // add
  } = useCreateElement()
</script>
```

Click the [Insert Web Page] button and you will see a web page element added to the canvas.

### Summarize

This is the basic process of customizing an element. The whole process is relatively tedious, but not complicated. The focus is on the definition of the element structure and the writing of element components, which determines what capabilities and appearance the new element will have. The other parts can just follow the pattern of the gourd.
In addition, there are some unnecessary adjustments: For example, if you want the export to support new elements, you need to expand it in the export-related methods; for example, if you want the theme function to be applied to new elements, you need to expand it in the theme-related methods. method, and so on.
