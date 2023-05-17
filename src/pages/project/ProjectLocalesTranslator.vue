<template>
  <q-page class="page-translator-lang">
    <portal to="toolbar-left">
      <q-breadcrumbs>
        <template v-slot:separator>
          <q-icon size="1em" name="svguse:#pl-arrow-right" style="color: rgba(123,123,123,0.7)" />
        </template>
        <q-breadcrumbs-el icon="svguse:#pl-back" :to="{ name: 'project-details' }" />
        <q-breadcrumbs-el :label="$t('projects')" :to="{ name: 'projects' }" />
        <q-breadcrumbs-el :icon="`img:${project.logo}`" :label="project.name" :to="{ name: 'project-details' }" />
        <q-breadcrumbs-el>
          <FlagIcon :code="lang" :shadowed="false" width="22px" height="18px" class="q-mr-sm" style="line-height: 1" />
          <span>{{ $t(`localeNames.${lang}`) }}</span>
        </q-breadcrumbs-el>
        <TranslateProcess :project="project" :language="lang" track-color="grey-4" circle class="q-mr-md self-center"
          size="30px" style="width: 40px;" />
      </q-breadcrumbs>
    </portal>

    <portal to="toolbar-right" class="flex">

      <QTableKeyword v-model="keyword" v-model:case-sensitive="caseSensitive" />
      <q-btn-group rounded dense unelevated>
        <q-btn dense size="md" icon="svguse:#pl-robot" @click="translateEmpties">
          <q-tooltip anchor="bottom middle" self="top middle" transition-show="scale" transition-hide="scale">
            {{ $t('translate empty fields automaticlly') }}
          </q-tooltip>
        </q-btn>
        <q-btn dense size="md" icon="save" @click="save">
          <q-tooltip anchor="bottom middle" self="top middle" transition-show="scale" transition-hide="scale">
            {{ $t('save') }}
          </q-tooltip>
        </q-btn>
      </q-btn-group>
    </portal>

    <div class="translate-form">

      <div id="stickyTrigger"><!--Keep for sticky detecting--></div>
      <dl id="rows-header" class="header row">
        <dt class="col-xs-6 relative-position q-px-md no-margin text-right justify-end">
          <q-space></q-space>
          <div style="align-self: center;">{{ $t(`localeNames.${project.language}`) }} ({{ $t('primary-language') }})
          </div>
          <FlagIcon :code="project.language" :shadowed="false" width="28px" height="21px" square
            class="fixed-bottom-left q-ml-sm" style="position: relative" />
        </dt>
        <dd class="col-xs-6 relative-position q-px-md no-margin justify-center">
          <!-- <q-select :model-value="lang" @update:model-value="handleLanguageChange" :options="project.enabledLanguages"
            dense>
          </q-select> -->
          <LanguageSelector :model-value="lang" @update:model-value="handleLanguageChange" dense
            :languages="project.enabledLanguages" />
        </dd>
      </dl>
      <dl class="row item no-padding" v-for="(text, key) in filteredTexts" :key="key" style="min-height: 40px"
        :class="{ current: current === key }" :data-key="key" :data-text="text" @click="focusInput($event, key)">

        <!-- 主语言 -->
        <dt class="base-text col-xs-6 relative-position q-px-md no-margin text-right justify-end q-py-sm"
          :class="text.length > 15 ? 'content-start' : 'items-center'">
          <span v-html="formatText(text)"></span>
        </dt>

        <!-- 需翻译的语言 -->
        <dd class="target-text col-xs-6 relative-position q-px-md no-margin justify-start flex" :class="{
            'content-start': text.length > 15,
            'items-center': text.length <= 15,
            'q-py-sm': !current || current!==key,
          }">

          <div v-if="!current || current!==key" class="" v-html="formatText(targetTexts[key])"></div>

          <q-input v-else dense borderless :debounce="700" :model-value="targetTexts[key]" ref="currentInput"
            :type="text.length > 15 ? 'textarea': 'text'" :rows="Math.ceil(text.length/15)" @focus="onInputFocus(key)"
            @update:model-value="(v)=>{updateText(key, v as string)}" />

          <!-- 翻译小工具栏 -->
          <div class="translate-tools absolute-top-left fadeInRight">
            <portal-target v-bind:name="`target-lang-tools-${key}`" :slot-props="{key, text}"></portal-target>
          </div>
        </dd>
      </dl>

      <portal v-bind:to="`target-lang-tools-${current}`" v-slot="{key, text}">

        <!-- Translate buttons -->
        <q-btn-dropdown dense flat split rounded outline size="sm" menu-self="top left" :menu-offset="[-60, 0]"
          icon="svguse:#pl-translate" @click="translate(key, text,)">
          <q-list style="min-width: 160px">
            <q-item v-for="provider in providers" :key="provider.key" :disable="!provider.enable" clickable dense
              v-close-popup @click="translate(key, text, provider.key)">
              <q-item-section side>
                <q-icon :name="`svguse:#pl-${provider.key}`" size="20px" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{$t(upperFirst(provider.name))}}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <!-- Copy buttons -->
        <q-btn-dropdown dense flat split rounded outline size="sm" menu-self="top left" :menu-offset="[-60, 0]"
          icon="svguse:#pl-copy" @click="copy(key, text)">
          <q-list style="min-width: 160px">
            <q-item clickable dense v-close-popup @click="copy(key, text, 'key')">
              {{ $t('Copy key') }}
            </q-item>
            <q-item clickable dense v-close-popup @click="copy(key, text, 'source')">{{ $t('Copy source text')
              }}</q-item>
            <q-item clickable dense v-close-popup @click="copy(key, text, 'target')">{{ $t('Copy target text')
              }}</q-item>
          </q-list>
        </q-btn-dropdown>

        <q-btn dense flat round outline size="sm" :disable="!voice" icon="svguse:#pl-speak"
          @click.stop="()=>speech.speak()"></q-btn>
        <q-separator vertical spaced />
        <q-btn dense flat round outline size="sm" icon="svguse:#pl-close" @click.stop="()=>current=''"></q-btn>
      </portal>
    </div>
  </q-page>
</template>


<script lang="ts" setup>
import { upperFirst } from 'lodash-es';
import pWaterfall from 'p-waterfall';
import { PROVIDERS, type TranslateProviderNames } from 'src/../src-electron/translator/constants';
import FlagIcon from 'src/components/FlagIcon.vue';
import LanguageSelector from 'src/components/LanguageSelector.vue';
import TranslateProcess from 'src/components/TranslateProcess.vue';
import { Project, useProjectStore } from 'src/stores/useProjectStore';
import { useTranslateStore } from 'src/stores/useTranslateStore';
import { electron } from 'src/util/electron';
import { countTranslateProcess, loadTextsOfLang } from 'src/util/project';
import { computed, onMounted, reactive, ref, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useStick from '../../compasibles/useSticky'
import {useQuasar} from 'quasar'
import {useI18n} from 'vue-i18n'
import useProvider from '../../compasibles/useProvider';
import { unflatten } from 'flat';
import plimit from 'p-limit'
import useTableFilter from '../../compasibles/useTableFilter'
import { useSpeechSynthesis } from '@vueuse/core'


// type ResultOfProvider = {
//   [k in TranslateProviderNames]?: {
//     result?: string;
//     status: 'normal' | 'loading' | 'success' | 'error';
//     provider: TranslateProviderNames;
//   };
// };
// type ResultMapOfProvider = {
//   [k: string]: ResultOfProvider;
// };
// type ProviderResult = {
//   status: 'normal' | 'loading' | 'success' | 'error';
//   text: string;
//   provider: TranslateProviderNames;
// }
// type Provider = {
//   key: PROVIDERS;
//   name: string;
//   enable: boolean;
//   texts: {
//     [k: string]: ProviderResult;
//   };
// }

const limit = plimit(6)
const fs = electron.getFs()
const $q = useQuasar()
const {t: $t} = useI18n()
const store = useProjectStore()
// const transStore = useTranslateStore()
const {providers} = useProvider()
const router = useRouter()
const route = useRoute()
const {keyword, caseSensitive, QTableKeyword} = useTableFilter()


// eslint-disable-next-line no-undef
const props = defineProps({
  id: { type: String, required: true, },
  lang: { type: String, required: true, },
})
useStick({
  element: '#rows-header',
  target: '#stickyTrigger',
  className: 'sticking'
})

const current = ref('')
const currentInput = ref<Element|null>(null)
// const currentTransResults = ref<ResultMapOfProvider>({})
const providerTexts = ref<Record<string,string>>({})
// const providerStatus = ref<Record<string, 'normal' | 'loading' | 'success' | 'error'>>({})
const baseTexts = ref<Record<string, any>>({})
const targetTexts = ref<Record<string, any>>({})
// const providers = computed<Provider[]>(()=>{
//   const enabledProviders = transStore.engines
//   return Object.values(PROVIDERS)
//   .sort((a,b)=> enabledProviders.indexOf(b) - enabledProviders.indexOf(a) )
//   .map(provider=>({
//     key: provider,
//     name: upperFirst(provider),
//     enable: enabledProviders.includes(provider),
//     texts: {}
//   }))
// })
const filteredTexts = computed(()=>{
  return keyword.value?.length < 2
    ? baseTexts.value
    : Object.fromEntries(
        Object.keys(baseTexts.value)
          .filter((k)=>{
            const kw = caseSensitive.value ? keyword.value : keyword.value?.toLowerCase()
            const bt = caseSensitive.value ? baseTexts.value[k] : baseTexts.value[k]?.toLowerCase()
            const tt = caseSensitive.value ? targetTexts.value[k] : targetTexts.value[k]?.toLowerCase()
            return bt?.includes(kw) || tt?.includes(kw)
          })
          .map(k=>[k, baseTexts.value[k]])
      )
})

const currentText = computed(()=>{ return targetTexts.value[current.value] })
const targetLang = computed<string>(()=>route.params.lang as string)
const voice = ref<SpeechSynthesisVoice>(undefined as unknown as SpeechSynthesisVoice)
const speech = useSpeechSynthesis(currentText, {
  voice,
  lang: targetLang,
  pitch: 1,
  rate: 1,
  volume: 1,
})

const counted = reactive({
  base: 0,
  target: 0,
})

const projects = computed(()=>store.projects)
const project = computed((): Project => {
  return projects.value.filter((p: Project) => {
    return p.id === route.params.id;
  })[0];
})
// const rows = computed((): {lang: string, text: string}[] =>{
//   return Object.keys(baseTexts.value).map((k => ({
//     lang: k,
//     text: (baseTexts.value as any)[k],
//   })));
// })

async function init() {
  const [bt, tt] = await Promise.all([
    loadTextsOfLang(project.value, project.value.language),
    loadTextsOfLang(project.value, props.lang)
  ])
  baseTexts.value = bt;
  targetTexts.value = tt;
  // baseTexts.value = await loadTextsOfLang(project.value, project.value.language);
  // targetTexts.value = await loadTextsOfLang(project.value, props.lang);
  const _counted = await countTranslateProcess(
    project.value,
    props.lang,
    { base: baseTexts.value, target: targetTexts.value}
  ) || { base: 0, target: 0, };
  Object.assign(counted, _counted)
}

function formatText(text: string) {
  return keyword.value?.length < 2
    ? text
    : text.replace(
        new RegExp(keyword.value, `g${caseSensitive.value?'':'i'}`),
        (t: string)=>`<b class="text-primary">${t}</b>`
      )
}

function handleLanguageChange(lang: string) {
  router.push({
    params: {...route.params, lang},
    query: route.query,
  })
}

function save() {
  const { path } = project.value;
  const lang = route.params.lang
  const filePath = `${path}/${lang}.json`;
  const content = unflatten(targetTexts.value);
  fs.writeFileSync(filePath, JSON.stringify(content, null, 4), 'utf8');
  console.log(`Save to ${filePath}`, content);
}

function copy(key:string, text:string, type: 'key'|'source'|'target'|'text'|'all' = 'text') {
  let content: string
  switch(type) {
    case 'all':
      content = `${key}\n${baseTexts.value[key]}\n${targetTexts.value[key]}`
      break
    case 'key':
      content = key
      break
    case 'source':
      content = baseTexts.value[key]
      break
    case 'target':
      content = targetTexts.value[key]
      break
    case 'text':
    default:
      content = `${baseTexts.value[key]||''}\n\n${targetTexts.value[key]||''}`
      break
  }
  console.log(key, content, baseTexts.value, baseTexts.value[key])
  electron.copy(content||'')
}

async function translateEmpties() {
  console.log('TODO: translateEmpties()')
  await Promise.all(
    Object.keys(baseTexts.value).map(k=>{
      return targetTexts.value[k] ? null : limit(
        () => electron.translate(baseTexts.value[k], props.lang, project.value.language)
          .then(
            (translation)=> {
              if (translation) {
                targetTexts.value[k] = translation
              }
              return translation
            }
          )
      )
    })
    .filter(a=>typeof a === 'function')
  )


}

const results = reactive<Record<string, string>>({})
async function translate(i18nKey: string, text: string, provider?: PROVIDERS) {
  let result = await (
    provider ?
      electron.translateByEngine(provider, text, props.lang, project.value.language) :
      electron.translate(text, props.lang, project.value.language)
  )

  if (!result) {
    return;
  }

  if (!targetTexts.value[i18nKey]) {
    await updateText(i18nKey, result)
  } else {
    await $q.dialog({
      title: $t('Translations'),
      message: `
        <div>${baseTexts.value[i18nKey]}</div>
        <hr class="q-separator q-separator--horizontal" />
        <div>${result}</div>
      `,
      html: true,
    }).onOk(async ()=>{
      results[props.lang+'_'+i18nKey] = result
      await updateText(i18nKey, result)
    })
  }
}

// async function translateText(provider: Provider, key: string, text: string,) {
//   const commonKey = `${provider.key}_${key}`;

//   try {
//     providerStatus.value[commonKey] = 'loading';
//     const translatedText = await electron.translateByEngine(provider.key, text, props.lang, project.value.language);

//     providerTexts.value[commonKey] = translatedText
//     provider.texts[key] = {text: translatedText, status: 'success', 'provider': provider.key};
//     currentTransResults.value[key][provider.key] = { result: translatedText, status: 'success', 'provider': provider.key};
//     providerStatus.value[commonKey] = 'success';
//   } catch (err) {
//     providerStatus.value[commonKey] = 'error';
//   }
// }
// async function translateByAllProviders(i18nKey: string, text: string,) {
//   await pWaterfall(
//     transStore.engines.map((provider) => async() => {
//       const commonKey = `${provider}_${i18nKey}`;
//       if (!['loading', 'success'].includes(providerStatus.value[commonKey])) {
//         const providerName = providers.value.find(k=>k.key===provider)
//         providerName && await translateText(providerName, i18nKey, text);
//       }
//     })
//   );
// }

async function updateText(key: string, value = '') {
  console.log(key, value);
  targetTexts.value[key] = value.trim();
  Object.assign(
    counted,
    await countTranslateProcess(project.value, props.lang) || { base: 0, target: 0, }
  )
}

function onInputFocus(key: string) {
  current.value = key;
  // currentText.value = targetTexts.value[key];
}

function focusInput(e: MouseEvent ,key: string) {
  current.value = key;
  // currentText.value = targetTexts.value[key];
  nextTick(()=>{
    const row: any = e.currentTarget;
    const input = row ? row.querySelector('.q-field__native') : null;
    input?.focus();
  })
}

// function save() {
//   saveTargetText(project.value, props.lang, targetTexts.value);
// }

onMounted(()=>{
  watch(
    ()=>props.lang,
    ()=>{
      init()
    },
    { immediate: true}
  )

  if (speech.isSupported.value) {
  // load at last
    setTimeout(() => {
      let synth = window.speechSynthesis
      let voices = synth.getVoices()
      let localeVoice1 = voices.filter((v)=>{
        return targetLang.value.toLowerCase() === v.lang.toLowerCase()
      })
      let localeVoice2 = voices.filter((v)=>{
        return targetLang.value.toLowerCase().split(/[-_]/)[0] === v.lang.toLowerCase().split(/[-_]/)[0]
      })
      voice.value = localeVoice1[0] || localeVoice2[0]
      // debugger
      // console.log(voice, voices)
    })
  }
})
</script>

<style lang="scss">
@use 'sass:color';

.page-translator-lang {
  font-family: unset;

  .language-selector {
    width: min-content;
    word-wrap: normal;
    word-break: keep-all;
    white-space: nowrap;
  }
}

.translate-form {
  position: relative;
  min-height: 100%;
  background-color: var(--p-bg1);

  &:before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 0;
    left: calc(50% - 2px);
    border-left: 4px solid $primary;
    border-left: 4px solid var(--q-primary);
    z-index: 4;
    box-shadow: 0px 0px 2px 1px rgba(0, 0, 0, 0.3);
    pointer-events: none;
  }

  dl {
    margin: 0 10px;
    border-left: 1px solid rgba(123, 123, 123, 0.1);
    border-right: 1px solid rgba(123, 123, 123, 0.1);

    &.header {
      margin: 0 0 10px;
      padding: 0 10px;
      background-color: var(--p-bg2) !important;
      position: sticky;
      z-index: 2;
      top: 0px;
      box-shadow: 0 0px 0px 0px rgba(0, 0, 0, 0);

      &.sticking {
        box-shadow: 0 1px 4px 0px rgba(0, 0, 0, 0.2);
      }

      dt,
      dd {
        align-items: center;
      }
    }

    &.item:hover,
    &.item:focus {
      background: rgba(123, 123, 123, 0.15);
    }

    &:nth-child(even) {
      background-color: rgba(123, 123, 123, 0.1);
    }

    &:nth-child(odd) {
      background-color: rgba(123, 123, 123, 0.18);
    }

    &.current {
      $BR: 4px;

      position: sticky;
      top: 40px;
      bottom: 0px;
      z-index: 3;
      box-shadow: 2px 4px 6px 2px rgba(0, 0, 0, 0.4);
      border-radius: $BR;
      border: 0;

      &,
      .q-field__native,
      .q-field__prefix,
      .q-field__suffix {
        color: #fff;
      }


      dt {
        border-right: 2px solid rgba(0, 0, 0, 0.2);
        border-radius: $BR 0 0 $BR;
        backdrop-filter: blur(5px);
        background-color: rgba(123, 123, 123, 1);
        color: #fff;
      }

      dd {
        color: #fff;
        z-index: 2;
        background-color: $primary !important;
        background-color: var(--q-primary) !important;
        border-radius: 0 $BR $BR 0;
      }

      .translate-tools {
        display: flex;
        left: 10px;
        height: 30px;
        top: -30px;
        padding: 2px 2px 2px .8em;
        z-index: 9999;
        box-shadow: 0px -1px 5px rgba(0, 0, 0, 0.5);
        border-radius: $BR $BR 0 0;
        animation-duration: .4s;
        animation-delay: .1s;
        animation-fill-mode: backwards;

        &,
        &:after {
          background-color: $primary !important;
          background-color: var(--q-primary) !important;
          background-image: linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0)) !important;
        }

        &:after {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          right: -10px;
          width: 20px;
          transform: skewX(20deg);
          box-shadow: 3px 0px 1px rgba(0, 0, 0, 0.5);
          z-index: -1;
          border-radius: 0 10px 0 0;
        }
      }
    }
  }

  dt {
    display: flex;
    width: calc(50% - 2px);
    color: rgba(123, 123, 123, 1);
    // align-items: center;
    background-color: rgba-opacity(--p-bg2-rgb, 0.5);

    * {
      cursor: default;
    }
  }

  dd {
    width: calc(50% + 2px);

  }

  .translate-tools {
    display: none;
  }

}

.base-flag,
.target-flag {
  display: none;
}

.base-flag {
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.target-flag {
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
}


.body--light {
  .page-translator-lang {
    dl.current {
      // box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);

      // dt {
      //   background-color: lightness(saturation($primary, 30%), 90%);
      // }
    }
  }
}

.q-btn-dropdown--split .q-btn-dropdown__arrow-container:not(.q-btn--outline) {
  border-left: 0;
  padding-left: 0;
}
</style>
