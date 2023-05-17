<template>
  <div class="settings-translate-deepl justify-center">
    <q-input v-model="authKey" :label="$t('Auth Key')" :rules="[v=>!!v||$t('* Required')]" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTranslateStore } from '../../stores/useTranslateStore';
import { type DeeplOptions } from '../../../src-electron/translator/constants';

const store = useTranslateStore()
const { t: $t} = useI18n()

const authKey = computed({
  get(){ return store.engineConfigs?.deepl?.authKey },
  set(authKey) {
    store.engineConfigs.deepl = store.engineConfigs.deepl || {} as DeeplOptions
    store.engineConfigs.deepl.authKey = authKey || ''
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
