<template>
  <div class="settings-translate-azure justify-center">
    <q-input v-model="apiKey" :label="$t('API key')" :rules="[v=>!!v||$t('* Required')]" />
    <q-input v-model="secretKey" :label="$t('Secret key')" :rules="[v=>!!v||$t('* Required')]" />
    <q-input v-model="accessToken" :label="$t('Access token')" :rules="[v=>!!v||$t('* Required')]" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTranslateStore } from '../../stores/useTranslateStore';
import { type BaiduOptions } from '../../../src-electron/translator/constants';

const store = useTranslateStore()
const { t: $t} = useI18n()

const apiKey = computed({
  get(){ return store.engineConfigs.baidu?.apiKey },
  set(apiKey) {
    store.engineConfigs.baidu = store.engineConfigs.baidu || {} as BaiduOptions
    store.engineConfigs.baidu.apiKey = apiKey || ''
  }
})

const secretKey = computed({
  get(){ return store.engineConfigs.baidu?.secretKey },
  set(secretKey) {
    store.engineConfigs.baidu = store.engineConfigs.baidu || {} as BaiduOptions
    store.engineConfigs.baidu.secretKey = secretKey || ''
  }
})

const accessToken = computed({
  get(){ return store.engineConfigs.baidu?.accessToken },
  set(accessToken) {
    store.engineConfigs.baidu = store.engineConfigs.baidu || {} as BaiduOptions
    store.engineConfigs.baidu.accessToken = accessToken || ''
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
