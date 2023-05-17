<template>
  <div class="settings-translate-azure justify-center">
    <q-input v-model="key" :label="$t('Subscription Key')" :rules="[v=>!!v||$t('* Required')]" />
    <q-input v-model="region" :label="$t('region')" :rules="[v=>!!v||$t('* Required')]" />

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTranslateStore } from '../../stores/useTranslateStore';
import { type AzureOptions } from '../../../src-electron/translator/constants';

const store = useTranslateStore()
const { t: $t} = useI18n()

const key = computed({
  get(){ return store.engineConfigs.azure?.key },
  set(key) {
    store.engineConfigs.azure = store.engineConfigs.azure || {} as AzureOptions
    store.engineConfigs.azure.key = key || ''
  }
})
const region = computed({
  get(){ return store.engineConfigs.azure?.region },
  set(region) {
    store.engineConfigs.azure = store.engineConfigs.azure || {} as AzureOptions
    store.engineConfigs.azure.region = region || ''
  }
})
</script>

<style lang="stylus">
.component-settings
  margin auto

  .section-separator
    display block
    height 0px;
    background-color rgba(123,123,123,0)
</style>
