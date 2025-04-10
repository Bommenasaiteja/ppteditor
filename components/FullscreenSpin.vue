<template>
  <div class="fullscreen-spin" v-if="loading">
    <div class="spin">
      <div class="spinner"></div>
      <div class="text">{{tip}}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{
  loading?: boolean
  tip?: string
}>(), {
  loading: false,
  tip: '',
})
</script>

<style lang="scss" scoped>
.fullscreen-spin {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99999999;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5); 
}
.spin {
  width: 350px;
  height: 200px;
  background-color: white; 
  border-radius: 10px; 
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 99999999;
  align-items: center;
  padding: 20px;
}
.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid $themeColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spinner .8s linear infinite;
  z-index: 100;
}
.text {
  margin-top: 20px;
  color: $themeColor;
  font-weight: bold;
  font-size: 1.5em;
}
@keyframes spinner {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>