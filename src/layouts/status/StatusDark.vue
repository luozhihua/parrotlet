<template>
  <q-toggle dense size="md" toggle-indeterminate indeterminate-value="auto" false-value="light" true-value="dark"
    :icon="`svguse:#pl-${store.darkMode ==='auto' ? 'dark-auto' : store.darkMode}`" :model-value="store.darkMode"
    @update:model-value="updateMode"></q-toggle>
</template>
<script lang="ts" setup>
import { DarkMode, useSettingStore } from '../../stores/useSettingStore';
const store = useSettingStore()

function updateMode(mode: DarkMode) {
  store.updateMode(mode)
}
</script>
