<template>
  <q-btn flat dense size="sm" no-caps>
    <div class="flex items-center self-center">
      <span class="q-mr-sm">{{ $t('Engine') }}</span>
      <q-icon class="q-mr-sm" v-for="engine in engines" :key="engine" :name="`svguse:#pl-${engine}`"></q-icon>
    </div>
    <q-popup-proxy>
      <div style="width: 500px">
        <TranslateEngine />
      </div>
    </q-popup-proxy>
  </q-btn>
</template>

<script setup lang="ts">
import { useTranslateStore } from '../../stores/useTranslateStore';
import TranslateEngine from '../../components/settings/TranslateEngine.vue'
import { storeToRefs } from 'pinia';

const Engine = useTranslateStore()
const {engines, enabledEngines} = storeToRefs(Engine)



</script>

