<template>

  <div class="ppt-editor">
    <EditorHeader :ppt_url=url :pk=pk class="layout-header" />
    <div class="layout-content">
      <Thumbnails class="layout-content-left" />
      <div class="layout-content-center">
        <CanvasTool class="center-top" />
        <Canvas
          class='center-body'
          :style='{ height: `calc(100% - ${remarkHeight + 56}px)` }'
        />
        <Remark
          class="center-bottom"
          v-model:height="remarkHeight"
          :style="{ height: `${remarkHeight}px` }"
        />
      </div>
      <Toolbar class="layout-content-right" />
    </div>
  </div>

  <SelectPanel v-if="showSelectPanel" />
  <SearchPanel v-if="showSearchPanel" />

  <Modal
    :visible="!!dialogForExport"
    :width="680"
    @closed="closeExportDialog()"
  >
    <ExportDialog />
  </Modal>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import useGlobalHotkey from '@/hooks/useGlobalHotkey'
import usePasteEvent from '@/hooks/usePasteEvent'

import EditorHeader from './EditorHeader/index.vue'
import Canvas from './Canvas/index.vue'
import CanvasTool from './CanvasTool/index.vue'
import Thumbnails from './Thumbnails/index.vue'
import Toolbar from './Toolbar/index.vue'
import Remark from './Remark/index.vue'
import ExportDialog from './ExportDialog/index.vue'
import SelectPanel from './SelectPanel.vue'
import SearchPanel from './SearchPanel.vue'
import Modal from '@/components/Modal.vue'

const mainStore = useMainStore()

const { dialogForExport, showSelectPanel, showSearchPanel } =
  storeToRefs(mainStore)
const closeExportDialog = () => mainStore.setDialogForExport('')

const remarkHeight = ref(40)

useGlobalHotkey()
usePasteEvent()

defineProps({
  url: String,
  pk: Number,
})

</script>


<style lang="scss" scoped>
.ppt-editor {
  height: 100%;
}
.layout-header {
  height: 70px;
}
.layout-content {
  height: calc(100% - 80px);
  display: flex;
}
.layout-content-left {
  width: 180px;
  height: 100%;
  flex-shrink: 0;
}
.layout-content-center {
  width: calc(100% - 180px - 260px);

.center-top {
    
    height: 56px;
  }
}
.layout-content-right {
  width: 260px;
  height: 100%;
}
</style>
