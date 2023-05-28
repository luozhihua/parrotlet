<template>
  <q-btn icon="svguse:#pl-network" no-caps flat dense size="sm" :label="$t('Proxy')"
    :color="settings.$state.proxy?.enable ? 'primary' : 'grey-5'">
    <q-popup-proxy>
      <div style="width: 500px">
        <NetworkSettings />
      </div>
    </q-popup-proxy>
  </q-btn>
</template>

<script setup lang="ts">
import { useSettingStore } from '../../stores/useSettingStore';
import NetworkSettings from '../../components/settings/NetworkSettings.vue'

const settings = useSettingStore()
</script>

