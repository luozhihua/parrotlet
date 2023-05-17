<template>
  <div class="settings-translate-google justify-center">
    <q-input v-model="store.engineConfigs.google!.projectId" :label="$t('Project ID')"
      :rules="[v=>!!v||$t('* Required')]" />
    <q-input type="textarea" v-model="authKeys" :label="$t('Auth keys')" :hint="$t('Get Auth keys from Google Cloud')"
      :rules="authKeysValidateRules" />

  </div>
</template>

<script setup lang="ts">
import { ValidationRule } from 'quasar';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTranslateStore } from '../../stores/useTranslateStore';
import { type GoogleOptions } from '../../../src-electron/translator/constants';

const store = useTranslateStore()
const { t: $t} = useI18n()

store.engineConfigs.google = store.engineConfigs.google || {} as GoogleOptions

const authKeys = computed({
  get: ()=> JSON.stringify(store.engineConfigs.google?.authKeys || '{}', null, 4),
  set: (v: string)=> {
    let keys: Record<string, string> | null = null
    try {
      keys = JSON.parse(v)
    } catch(e: unknown) {
      console.error(e)
    }
    if (keys) {
      store.engineConfigs.google!.authKeys = keys
    }
  }
})

const authKeysValidateRules: ValidationRule[] = [
  (v: string) => (!!v || $t('Auth keys is required')),
  (v: string) => {
    let keys: Record<string, string> | null

    try{keys= JSON.parse(v)} catch(err:unknown) {keys=null}
    if (!keys) {
      return $t('Auth keys should be an JSON object')
    }
    return true
  }
]
</script>

<style lang="stylus">
.component-settings
  margin auto

  .section-separator
    display block
    height 0px;
    background-color rgba(123,123,123,0)
</style>
