<template>
  <q-btn flat dense size="xs">
    <div>
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

const {engines, enabledEngines} = useTranslateStore()



</script>

