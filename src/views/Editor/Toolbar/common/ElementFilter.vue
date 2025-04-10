<template>
  <div class="element-filter">
    <div class="row">
      <div style="flex: 2"><b>Enable filters:</b></div>
      <div class="switch-wrapper" style="flex: 3">
        <Switch
          :value="hasFilters"
          @update:value="(value) => toggleFilters(value)"
        />
      </div>
    </div>
    <div class="filter" v-if="hasFilters">
      <div
        class="filter-item"
        v-for="filter in filterOptions"
        :key="filter.key"
      >
        <div class="name">{{ filter.label }}</div>
        <Slider
          class="filter-slider"
          :max="filter.max"
          :min="0"
          :step="filter.step"
          :value="filter.value"
          @update:value="value => updateFilter(filter, value as number)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import type { ImageElementFilterKeys, PPTImageElement } from '@/types/slides'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

import Switch from '@/components/Switch.vue'
import Slider from '@/components/Slider.vue'

interface FilterOption {
  label: string
  key: ImageElementFilterKeys
  default: number
  value: number
  unit: string
  max: number
  step: number
}

const defaultFilters: FilterOption[] = [
  {
    label: 'blur',
    key: 'blur',
    default: 0,
    value: 0,
    unit: 'px',
    max: 10,
    step: 1,
  },
  {
    label: 'brightness',
    key: 'brightness',
    default: 100,
    value: 100,
    unit: '%',
    max: 200,
    step: 5,
  },
  {
    label: 'contrast',
    key: 'contrast',
    default: 100,
    value: 100,
    unit: '%',
    max: 200,
    step: 5,
  },
  {
    label: 'Grayscale',
    key: 'grayscale',
    default: 0,
    value: 0,
    unit: '%',
    max: 100,
    step: 5,
  },
  {
    label: 'saturate',
    key: 'saturate',
    default: 100,
    value: 100,
    unit: '%',
    max: 200,
    step: 5,
  },
  {
    label: 'hue',
    key: 'hue-rotate',
    default: 0,
    value: 0,
    unit: 'deg',
    max: 360,
    step: 10,
  },
  {
    label: 'opacity',
    key: 'opacity',
    default: 100,
    value: 100,
    unit: '%',
    max: 100,
    step: 5,
  },
]

const slidesStore = useSlidesStore()
const { handleElement, handleElementId } = storeToRefs(useMainStore())

const filterOptions = ref<FilterOption[]>(
  JSON.parse(JSON.stringify(defaultFilters))
)
const hasFilters = ref(false)

const { addHistorySnapshot } = useHistorySnapshot()

watch(
  handleElement,
  () => {
    if (!handleElement.value || handleElement.value.type !== 'image') return

    const filters = handleElement.value.filters
    if (filters) {
      filterOptions.value = defaultFilters.map((item) => {
        const filterItem = filters[item.key]
        if (filterItem) return { ...item, value: parseInt(filterItem) }
        return item
      })
      hasFilters.value = true
    } else {
      filterOptions.value = JSON.parse(JSON.stringify(defaultFilters))
      hasFilters.value = false
    }
  },
  { deep: true, immediate: true }
)

// 设置滤镜
const updateFilter = (filter: FilterOption, value: number) => {
  const _handleElement = handleElement.value as PPTImageElement

  const originFilters = _handleElement.filters || {}
  const filters = { ...originFilters, [filter.key]: `${value}${filter.unit}` }
  slidesStore.updateElement({ id: handleElementId.value, props: { filters } })
  addHistorySnapshot()
}

const toggleFilters = (checked: boolean) => {
  if (!handleElement.value) return
  if (checked) {
    slidesStore.updateElement({
      id: handleElement.value.id,
      props: { filters: {} },
    })
  } else {
    slidesStore.removeElementProps({
      id: handleElement.value.id,
      propName: 'filters',
    })
  }
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
.switch-wrapper {
  text-align: right;
}
.filter {
  font-size: 12px;
}
.filter-item {
  padding: 6px 0;
  display: flex;
  justify-content: center;
  align-items: center;

  .name {
    width: 60px;
  }
  .filter-slider {
    flex: 1;
    margin: 0 6px;
  }
}
</style>
