<template>
  <q-page class="app-page page-settings justify-center">
    <div class="page-settings-wrapper q-py-xl">
      <portal to="toolbar-left">
        <q-btn dense flat :to="{ name: 'project-details' }" icon="chevron_left">{{$t('done') }}</q-btn>
      </portal>
      <AllSettings />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import AllSettings from '../components/settings/AllSettings.vue';
// import { computed } from 'vue';
// import { useSettingStore } from '../stores/useSettingStore';

// const store = useSettingStore()

// const tmpSettings = reactive({})
// const results = ref([])
// const settings = computed(()=>store.getters[`${moduleNames.settings}/settings`])

// function mergeSettings(value: any) {
//   return store.dispatch(`${moduleNames.settings}/mergeSettings`, value)
// }
// function saveMode(value: any) {
//   return store.dispatch(`${moduleNames.settings}/saveMode`, value)
// }
// function saveLanguage(value: any) {
//   return store.dispatch(`${moduleNames.settings}/saveLanguage`, value)
// }
</script>

<style lang="stylus">
.page-settings
  .page-settings-wrapper
    max-width 800px
    margin auto
</style>
