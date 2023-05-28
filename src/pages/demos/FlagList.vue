<template>
  <q-card class="FlagList">
    <q-card-section>
      <div class="row q-col-gutter-lg">
        <div class="col col-xs-4 col-sm-3 col-md-2 col-lg-1 text-center q-pa-lg" v-for="lang in langs" :key="lang">
          <FlagIcon rounded :code="lang" />
          <div>{{ lang }}</div>
          <div>{{ $t(`localeNames.${lang}`) }}</div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script lang="ts" setup>
import {ref} from 'vue';
import FlagIcon from '../../components/FlagIcon.vue';
import * as baseLangTexts from '../../i18n/langs/zh-CN.json';

const allLocaleCodes = Object.keys((baseLangTexts as any).localeNames);
// const localeNames = ref(baseLangTexts.localeNames)
const langs = ref(allLocaleCodes)
</script>

<style lang="scss">
.FlagList {
  background-color: red !important;
}
</style>
