<template>
  <div class="component-settings justify-center">
    <q-card>
      <q-card-section class="q-py-none">
        <LanguageSelector v-model="store.$state.language" :languages="languages" />
      </q-card-section>
    </q-card>

    <div class="section-separator"></div>

    <DarkMode />

    <div class="section-separator"></div>

    <TranslateEngine />

    <div class="section-separator"></div>

    <NetworkSettings />

    <div class="section-separator"></div>

  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import languages from 'src/i18n/langs/languages.json';
import { computed, onMounted } from 'vue';
import { useSettingStore } from '../../stores/useSettingStore';
import { importQuasarLang } from '../../util/quasar-langs';
import DarkMode from './DarkMode.vue';
import NetworkSettings from './NetworkSettings.vue';
import TranslateEngine from './TranslateEngine.vue';
import LanguageSelector from '../LanguageSelector.vue';

const store = useSettingStore()
const $q = useQuasar()

// const text = ref( '没有苹果|一个苹果| {count}个苹果');
// const results = ref( []);
const settings = computed(()=>store.allSettings)
// const languageList = computed((): {label:string, value: string}[] => {
//   const langs = languages;
//   return langs ? Object.keys(langs).map(lang => ({
//     label: (langs as any)[lang],
//     value: lang
//   })) : [];
// })

// async function onLanguageChange (language: string) {
//   // if (typeof language === 'string') {
//   //   language = languageList.value.filter(lang => lang.value === language)[0]
//   // }

//   store.updateLanguage(language);

//   try {
//     const lang = await importQuasarLang(language);
//     $q.lang.set(lang);
//   } catch (err) {
//     // console.log(err);
//   }
// }

onMounted(()=>{
  // onLanguageChange(store.language);
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
