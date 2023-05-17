<template>
  <div class="settings-translate-huawei justify-center">
    <q-input v-model="region" :label="$t('Region')" :rules="[v=>!!v||$t('* Required')]" />
    <q-input v-model="projectId" :label="$t('Project ID')" :rules="[v=>!!v||$t('* Required')]" />
    <q-input v-model="key" :label="$t('Access Key')" :rules="[v=>!!v||$t('* Required')]" />
    <q-input v-model="secret" :label="$t('Secret')" :rules="[v=>!!v||$t('* Required')]" />

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTranslateStore } from '../../stores/useTranslateStore';
import { type HuaweiOptions } from '../../../src-electron/translator/constants';

const store = useTranslateStore()
const { t: $t} = useI18n()

const key = computed({
  get(){ return store.engineConfigs.huawei?.key },
  set(key) {
    store.engineConfigs.huawei = store.engineConfigs.huawei || {} as HuaweiOptions
    store.engineConfigs.huawei.key = key || ''
  }
})
const secret = computed({
  get(){ return store.engineConfigs.huawei?.secret },
  set(secret) {
    store.engineConfigs.huawei = store.engineConfigs.huawei || {} as HuaweiOptions
    store.engineConfigs.huawei.secret = secret || ''
  }
})
const region = computed({
  get(){ return store.engineConfigs.huawei?.region },
  set(region) {
    store.engineConfigs.huawei = store.engineConfigs.huawei || {} as HuaweiOptions
    store.engineConfigs.huawei.region = region || ''
  }
})
const projectId = computed({
  get(){ return store.engineConfigs.huawei?.projectId },
  set(projectId) {
    store.engineConfigs.huawei = store.engineConfigs.huawei || {} as HuaweiOptions
    store.engineConfigs.huawei.projectId = projectId || ''
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
