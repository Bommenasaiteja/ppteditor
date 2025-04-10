// eslint-disable-next-line
/* eslint-disable */
<template>
  <div class="editor-header">
    <div class="left">
    <div class="logotop">
      <a :href="`${dashboardUrl}`" class="navbar-brand home nav-anchor">
        <img :src="`${logoUrl}`" alt="Logo" width="40" height="38"
          class="nav-logo-img">
        <p class="nav-logo-text"> Presentix </p>
    </a>
    </div>
      
      <div class="title">
        <Input  disabled
          class="title-input" 
          ref="titleInputRef"
          v-model:value="titleValue" 
          @blur="handleUpdateTitle()" 
          v-if="editingTitle" 
        ></Input>
        <!--
        <div 
          class="title-text"
          @click="startEditTitle()"
          :title="title"
          v-else
        >{{ title }}</div>
        -->
      </div>
      <div>
             <!--<button class="saveppt" @click="save()">Save</button>-->
      </div>
    </div>

    <div class="right">
    <Popover trigger="click" placement="bottom-start" v-model:value="mainMenuVisible">
        <template #content>
          <PopoverMenuItem @click="setDialogForExport('pptx')">Export file</PopoverMenuItem>
          <PopoverMenuItem @click="resetSlides(); mainMenuVisible = false">Reset slideshow</PopoverMenuItem>
          <PopoverMenuItem @click="mainMenuVisible = false; hotkeyDrawerVisible = true">shortcut key</PopoverMenuItem>
        </template>
        <div class="menu-item"><IconHamburgerButton class="icon" /></div>
      </Popover>
    <div class="menu-item" v-tooltip="'Save'" @click="save()">
        <IconDownload class="icon" />
      </div>
      <div class="group-menu-item">
        <div class="menu-item" v-tooltip="'Slideshow'" @click="enterScreening()">
          <IconPpt class="icon" />
        </div>
        <Popover trigger="click" center>
          <template #content>
            <PopoverMenuItem @click="enterScreeningFromStart()">Start from scratch</PopoverMenuItem>
            <PopoverMenuItem @click="enterScreening()">Start from current page</PopoverMenuItem>
          </template>
          <div class="arrow-btn"><IconDown class="arrow" /></div>
        </Popover>
      </div>
      <div class="menu-item" v-tooltip="'Export PPTX'" @click="setDialogForExport('pptx')">
        <IconExport class="icon" />
      </div>
      
     
    </div>

    <Drawer
      :width="320"
      v-model:visible="hotkeyDrawerVisible"
      placement="right"
    >
      <HotkeyDoc />
    </Drawer>
    <FullscreenSpin :loading="saving" tip="Saving..." />
    <FullscreenSpin :loading="importing" tip="Importing..." />
    <FullscreenSpin :loading="exporting" tip="Exporting..." />
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, nextTick, ref, toRefs } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import useScreening from '@/hooks/useScreening'
import useImport from '@/hooks/useImport'
import useExport from '@/hooks/useExport'

import useSlideHandler from '@/hooks/useSlideHandler'
import type { DialogForExportTypes } from '@/types/export'
import { encrypt } from '@/utils/crypto'

import HotkeyDoc from './HotkeyDoc.vue'
import FileInput from '@/components/FileInput.vue'
import FullscreenSpin from '@/components/FullscreenSpin.vue'
import Drawer from '@/components/Drawer.vue'
import Input from '@/components/Input.vue'
import Popover from '@/components/Popover.vue'
import PopoverMenuItem from '@/components/PopoverMenuItem.vue'

import axios from 'axios'
import { before } from 'lodash'
import saveAs from 'file-saver'
import message from '@/utils/message'

const api = ref(process.env.VUE_APP_DASHBOARD_URL)

const dashboardUrl = new URL('/dashboard', api.value).toString()
const logoUrl = new URL('/static/img/presentix_logo.svg', api.value).toString()

const mainStore = useMainStore()
const slidesStore = useSlidesStore()
const { title } = storeToRefs(slidesStore)
const { enterScreening, enterScreeningFromStart } = useScreening()
const { importSpecificFile, importPPTXFile, importPaper, exporting} = useImport()
const { resetSlides } = useSlideHandler()

const { savePPTX } = useExport()

const mainMenuVisible = ref(false)
const hotkeyDrawerVisible = ref(false)
const editingTitle = ref(false)
const titleInputRef = ref<InstanceType<typeof Input>>()
const titleValue = ref('')
const saving = ref(false)
const importing = ref(false)

const startEditTitle = () => {
  titleValue.value = title.value
  editingTitle.value = true
  nextTick(() => titleInputRef.value?.focus())
}

const save = async () => {
  saving.value = true

  const getCookie = (name: string) => {
    let cookieValue = null
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';')
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim()
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
          break
        }
      }
    }
    return cookieValue
  }

  try {
    const csrfToken = getCookie('csrftoken')
    
    const { slides } = storeToRefs(useSlidesStore())
    
    const blob = await savePPTX(slides.value, false, false)
    const fileName = ppt_url.value?.substring(ppt_url.value.lastIndexOf('/') + 1) || 'presentation.pptx'
    const ppt_file = new File([blob], fileName)
    
    const bodyFormData = new FormData()
    bodyFormData.append('ppt', ppt_file)
    bodyFormData.append('pk', pk.value)

    const url = new URL('/updatePPTX/', api.value).toString()
    const response = await axios({
      method: 'post',
      url,
      data: bodyFormData,
      headers: { 
        'Content-Type': 'multipart/form-data',
        'X-CSRFToken': csrfToken
      }
    })
    if (response.status === 200) {
      message.success('PowerPoint file saved successfully')
    } else {
      message.error('Failed to save PowerPoint file')
    }

  } catch (error) {

    message.error('Failed to save PowerPoint file. Please try again')
    
  } finally {
    saving.value = false
  }
}

const handleUpdateTitle = () => {
  slidesStore.setTitle(titleValue.value)
  editingTitle.value = false
}

const goLink = (url: string) => {
  window.open(url)
  mainMenuVisible.value = false
}

const setDialogForExport = (type: DialogForExportTypes) => {
  mainStore.setDialogForExport(type)
  mainMenuVisible.value = false
}
const props = defineProps({
  ppt_url: String,
  pk: Number,
})

const { ppt_url } = toRefs(props)
const { pk } = toRefs(props)
// const handleExport = async () => {
//   if (!ppt_url.value) {
//     message.error('No PPTX file URL available')
//     return
//   }

//   try {
//     const currentUrl = window.location.pathname
//     const presentationName = currentUrl.split('/').filter(part => part)[2]
//     const fileName = `${presentationName}.pptx`

//     const response = await axios.get(ppt_url.value, {
//       responseType: 'blob'
//     })
    
//     const blob = new Blob([response.data], {
//       type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
//     })
    
//     // Create download completion detector
//     const downloadComplete = () => {
//       message.success('PowerPoint file downloaded successfully')
//     }

//     // Listen for the focus event which happens after save dialog
//     window.addEventListener('focus', downloadComplete, { once: true })
    
//     saveAs(blob, fileName)

//   } catch (error) {
//     message.error('Failed to download PowerPoint file. Please try again.')
//   }
// }


// ppt_url
function load_file() {  
  importing.value = true
  if (!ppt_url.value) {
    message.error('No PowerPoint file URL available')
    importing.value = false
    return
  }
  
  const config = { responseType: 'blob' }
  axios.get(ppt_url.value, config)
    .then(async response => {      
      if (!response || !response.data) {
        throw new Error('Invalid response from server')
      }
      
      const filename = ppt_url.value?.substring(ppt_url.value.lastIndexOf('/') + 1) || 'unnamed.pptx'
      
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' 
      })
      const ppt_file = new File([blob], filename)
      if (ppt_file.size === 0) {
        throw new Error('Created file is empty')
      }
      await importPPTXFile(ppt_file)

      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 1000)
      })
    })
    .then(() => {
      importing.value = false
      message.success('PowerPoint loaded successfully')
    })
    .catch(error => {
      importing.value = false 
      if (error.response?.status === 404) {
        message.error('PowerPoint file not found')
      } else if (error.message === 'Created file is empty') {
        message.error('Cannot load empty PowerPoint file')
      } else if (error.message === 'Invalid response from server') {
        message.error('Server returned invalid data')
      } else {
        message.error('Failed to load PowerPoint file. Please try again')
      }
    })
}
onBeforeMount(() => load_file())



</script>

<style lang="scss" scoped>
.editor-header {
  --tw-bg-opacity: 1;
  background-color: #f8f9fa;
  user-select: none;
  border-bottom: 1px solid #808080;
  display: flex;
  justify-content: space-between;
}
.left, .right {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.menu-item {
  height: 30px;
  margin: 0 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  padding: 0 10px;
  cursor: pointer;

  .icon {
    font-size: 24px;
    color: #000;
  }

  &:hover {
    .icon {
      color: #52B394;
    }
  }
}
.group-menu-item {
  height: 30px;
  display: flex;
  margin: 0 8px;
  padding: 0 2px;
  border-radius: $borderRadius;
  color:#000;

  &:hover {
    color: #52B394;
  }

  .menu-item {
    padding: 0 3px;
  }
  .arrow-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    color:#000;
  }
}

.title {
  height: 32px;
  margin-left: 2px;
  font-size: 13px;

  .title-input {
    width: 200px;
    height: 100%;
    padding-left: 0;
    padding-right: 0;
  }
  .title-text {
    min-width: 20px;
    max-width: 400px;
    line-height: 32px;
    padding: 0 6px;
    border-radius: $borderRadius;
    cursor: pointer;
    color:#fff;

    @include ellipsis-oneline();

    &:hover {
      --tw-bg-opacity: 1;
  background-color: #52B394;
  color:#fff;
    }
  }
}

.saveppt
{
  background-color: #555555; 
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 18px;
  margin-left: 80px;
  cursor:pointer;
}
.logotop{
  height: 100%;
  border-color: #000;
  display: flex;
  align-items: center;
}

.nav-anchor{
  padding: 0px 12px;
  display: flex;
  align-items: center;
}

.nav-logo-img{
  display: inline-block;
  vertical-align: text-top;
  margin: auto 0;
}

.nav-logo-text{
  display: inline-block;
  vertical-align: middle;
  font-size: 28px;
  font-weight: 500;
  margin: auto 0.8rem;
  color: black;
  font-family: "Segoe UI", sans-serif;
}
  
</style>