<template>
  <div class="settings-translate-tencent justify-center">

    <q-input v-model="form.appId" :label="$t('App ID')" :rules="[v=>!!v||$t('* Required')]" />
    <q-input v-model="form.region" :label="$t('Region')" :rules="[v=>!!v||$t('* Required')]" />

    <q-tabs v-model="form.credentialType" dense inline-label align="left" :breakpoint="0">
      <q-tab name="secret" icon="svguse:#pl-key" :label="$t('Secret')" />
      <q-tab name="token" icon="svguse:#pl-token" :label="$t('Token')" />
    </q-tabs>
    <div v-if="form.credentialType === 'token'">
      <q-input v-model="form.token" :label="$t('Token')" :hint="$t('Get Token from Tencent Cloud')"
        :rules="[v=>!!v||$t('* Required')]" />
    </div>
    <div v-else>
      <q-input v-model="form.secretId" :label="$t('Secret ID')" :hint="$t('Get Secret ID from Tencent Cloud')"
        :rules="[v=>!!v||$t('* Required')]" />
      <q-input v-model="form.secretKey" :label="$t('Secret Key')" :hint="$t('Get Secret Key from Tencent Cloud')"
        :rules="[v=>!!v||$t('* Required')]" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useTranslateStore } from '../../stores/useTranslateStore';
import { type TencentOptions } from '../../../src-electron/translator/constants';
import { reactive, watch } from 'vue';
import { set as deepSet } from 'lodash-es'

const store = useTranslateStore()
const { t: $t} = useI18n()

store.engineConfigs.tencent = store.engineConfigs.tencent || {} as TencentOptions

const credential = store.engineConfigs.tencent?.client?.credential as Record<string, string|undefined>
const form = reactive({
  credentialType: 'secret',
  appId: store.engineConfigs.tencent?.appId,
  secretId: credential?.secretId,
  secretKey: credential?.secretKey,
  token: credential?.token,
  region: store.engineConfigs.tencent?.client?.region,
})

watch(
  ()=>form,
  (f)=>{
    deepSet(store.engineConfigs, 'tencent.credentialType', f.credentialType)
    deepSet(store.engineConfigs, 'tencent.appId', f.appId)
    deepSet(store.engineConfigs, 'tencent.client.credential.secretId', f.secretId)
    deepSet(store.engineConfigs, 'tencent.client.credential.secretKey', f.secretKey)
    deepSet(store.engineConfigs, 'tencent.client.credential.token', f.token)
    deepSet(store.engineConfigs, 'tencent.client.region', f.region)
  },
  {deep: true}
)
</script>

<style lang="stylus">
.component-settings
  margin auto

  .section-separator
    display block
    height 0px;
    background-color rgba(123,123,123,0)
</style>
