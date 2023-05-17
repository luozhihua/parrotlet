<template>
  <q-page class="flex flex-center">
    <div>
      <q-btn class="full-width q-my-xl" color="primary" :to="{ name: 'projects' }">所有项目</q-btn>
      <div class="text-h5">
        Text: {{ text }}
        <q-btn size="sm" icon="g_translate" flat @click="handleTranslate" />
      </div>
      <ul>
        <li v-for="r in results" :key="r.lang" :style="{ color: r.lang === store.language ? 'red' : '' }">{{ r.text }}
        </li>
      </ul>

      <pre>{{ locale }}</pre>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import {useSettingStore} from 'stores/useSettingStore';
import {useTranslateStore} from 'src/stores/useTranslateStore';
import {ref, watch, onMounted} from 'vue'
// import { electron } from '../util/electron';
// import { PROVIDERS } from '../../src-electron/translator/constants';
import { useLocaleStore } from '../stores/useLocaleStore';

const store = useSettingStore()
const locale = useLocaleStore()
const transStore = useTranslateStore()
const text = ref('没有苹果|一个苹果|{count}个苹果')
const results = ref<any[]>([])
async function handleTranslate () {
  // const langs = store.languages || {};
  // const targets = Object.keys(langs);
  // results.value = [];
  // targets.forEach(async (target) => {
  //   try {
  //     const translation = await electron.translate(text.value, target, 'zh-CN');
  //     results.value.push({ lang: target, text: `${target} => ${translation}` });
  //   } catch (e: unknown) {
  //     // debugger
  //     results.value.push({ lang: target, text: `${target} => ${(e as Error).message || 'error'}` });
  //   }
  // });
}

locale.initProjectLocale('voInYdew')
onMounted(()=>{
  watch(
    ()=>transStore.$state,
    ()=> {
      handleTranslate();
    },
    {deep: true, immediate: true}
  )
})

</script>
