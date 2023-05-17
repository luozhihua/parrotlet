<template>
  <div class="settings-translate-aliyun justify-center">
    <q-input v-model="accessKeyId" :label="$t('Access Key Id')" :rules="[v=>!!v||$t('* Required')]" />
    <q-input v-model="accessKeySecret" :label="$t('Access Key Secret')" :rules="[v=>!!v||$t('* Required')]" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTranslateStore } from '../../stores/useTranslateStore';
import { type AliyunOptions } from '../../../src-electron/translator/constants';

const store = useTranslateStore()
const { t: $t} = useI18n()

const accessKeyId = computed({
  get(){ return store.engineConfigs.aliyun?.accessKeyId },
  set(accessKeyId) {
    store.engineConfigs.aliyun = store.engineConfigs.aliyun || {} as AliyunOptions
    store.engineConfigs.aliyun.accessKeyId = accessKeyId || ''
  }
})
const accessKeySecret = computed({
  get(){ return store.engineConfigs.aliyun?.accessKeySecret },
  set(accessKeySecret) {
    store.engineConfigs.aliyun = store.engineConfigs.aliyun || {} as AliyunOptions
    store.engineConfigs.aliyun.accessKeySecret = accessKeySecret || ''
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
