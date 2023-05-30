<template>
  <q-page class="page-translator-lang">
    <portal to="toolbar-left">
      <q-breadcrumbs>
        <template v-slot:separator>
          <q-icon size="1em" name="svguse:#pl-arrow-right" style="color: rgba(123,123,123,0.7)" />
        </template>
        <q-breadcrumbs-el icon="svguse:#pl-back" :to="{ name: 'projects' }" />
        <q-breadcrumbs-el :icon="`img:${project.logo}`" :label="project.name"
          :to="{ name: 'project-translator', params: {id: project.id} }" />
        <q-breadcrumbs-el>
          <FlagIcon :code="lang" :shadowed="false" width="28px" square class="q-mr-sm" style="line-height: 1" />
          <span>{{ $t(`localeNames.${lang}`) }}</span>
        </q-breadcrumbs-el>
      </q-breadcrumbs>
    </portal>

    <portal to="toolbar-center" class="flex">
      <q-btn flat round dense size="md" icon="svguse:#pl-undo" :disable="!$history.canUndo" @click="$history.undo()">
        <q-tooltip>{{$t('Undo')}}</q-tooltip>
      </q-btn>
      <q-btn flat round dense size="md" icon="svguse:#pl-redo" :disable="!$history.canRedo" @click="$history.redo()">
        <q-tooltip>{{$t('Redo')}}</q-tooltip>
      </q-btn>
      <q-btn flat dense round :disable="!$history.canUndo && !$history.canRedo" size="md" icon="save"
        @click="()=>save(route.params.lang as string)">
        <q-tooltip anchor="bottom middle" self="top middle" transition-show="scale" transition-hide="scale">
          {{ $t('save') }}
        </q-tooltip>
      </q-btn>
    </portal>
    <portal to="toolbar-right" class="flex">
      <QTableKeyword v-model="keyword" v-model:case-sensitive="caseSensitive" />
      <q-btn flat dense round size="md" icon="svguse:#pl-robot"
        @click="async ()=>{await translateLocaleFile(route.params.lang as string); $history.commit()}">
        <q-tooltip anchor="bottom middle" self="top middle" transition-show="scale" transition-hide="scale">
          {{ $t('translate empty fields automaticlly') }}
        </q-tooltip>
      </q-btn>
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
        <dd class="col-xs-6 relative-position q-px-md no-margin justify-start flex">
          <!-- <q-select :model-value="lang" @update:model-value="handleLanguageChange" :options="project.enabledLanguages"
            dense>
          </q-select> -->
          <LanguageSelector :model-value="lang" @update:model-value="handleLanguageChange"
            :languages="project.enabledLanguages" :use-input="false" :label="null" :placeholder="''">
            <template #before></template>
            <template #append></template>
          </LanguageSelector>
          <q-space></q-space>
          <TranslateProcess :progress="localeStore.getProgress(project.id, lang)" track-color="red" rounded
            :thickness="0.1" class="q-ml-md self-center" size="1em" style="width: 80px;" label>
          </TranslateProcess>
        </dd>
      </dl>
      <dl class="row item no-padding" v-for="(text, key) in filteredTexts" :key="key" style="min-height: 40px"
        :class="{ current: current === key }" :data-key="key" :data-text="text"
        @click="focusInput($event, key as string)">

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

          <div v-if="!current || current!==key" class="" v-html="formatText(targetTexts?.[key]||'')"></div>

          <q-input v-else dense borderless :debounce="700" :model-value="targetTexts?.[key]" ref="currentInput"
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
          icon="svguse:#pl-translate" @click="doTranslate(key, lang,)">
          <q-list style="min-width: 160px">
            <q-item v-for="provider in providers" :key="provider.key" :disable="!provider.enable" clickable dense
              v-close-popup @click="doTranslate(key, lang, provider.key)">
              <q-item-section side>
                <q-icon :name="`svguse:#pl-${provider.key}`" size="20px" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{upperFirst($t(provider.key))}}</q-item-label>
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
import { set, upperFirst } from 'lodash-es';
import FlagIcon from 'src/components/FlagIcon.vue';
import LanguageSelector from 'src/components/LanguageSelector.vue';
import TranslateProcess from 'src/components/TranslateProcess.vue';
import { useLocaleStore } from 'src/stores/useLocaleStore';
import { Project, useProjectStore } from 'src/stores/useProjectStore';
import { electron } from 'src/util/electron';
import { useSpeechSynthesis } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, shallowReactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import plimit from '../../../src-common/plimit';
import useProvider from '../../compasibles/useProvider';
import useSticky from '../../compasibles/useSticky';
import useTableFilter from '../../compasibles/useTableFilter';
import useHistory from '../../compasibles/useHistory';
import { type PROVIDERS } from '../../../src-electron/translator/constants';

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
const localeStore = useLocaleStore()
const { getTextsOfLang, baseTexts } = storeToRefs(localeStore)
const {translate, translateLocaleFile, save } = localeStore

// eslint-disable-next-line no-undef
const props = defineProps({
  id: { type: String, required: true, },
  lang: { type: String, required: true, },
})
useSticky({
  element: '#rows-header',
  target: '#stickyTrigger',
  className: 'sticking'
})
const $historyList = reactive<Record<string, ReturnType<typeof useHistory>>>({})
const $history = computed(()=>$historyList[`${props.id}-${props.lang}`])
const current = ref('')
const currentInput = ref<Element|null>(null)
const targetTexts = computed({
  get: ()=>getTextsOfLang.value(props.lang),
  set: (texts)=>{
    set(localeStore, `state.projects.${project.value.id}.${props.lang}`, texts)
  },
})
const filteredTexts = computed(()=>{
  return keyword.value?.length < 2
    ? baseTexts.value
    : Object.fromEntries(
        Object.keys(baseTexts.value!)
          .filter((k)=>{
            const kw = caseSensitive.value ? keyword.value : keyword.value?.toLowerCase()
            const bt = caseSensitive.value ? baseTexts?.value?.[k] : baseTexts?.value?.[k]?.toLowerCase()
            const tt = caseSensitive.value ? targetTexts?.value?.[k] : targetTexts?.value?.[k]?.toLowerCase()
            return bt?.includes(kw) || tt?.includes(kw)
          })
          .map(k=>[k, baseTexts?.value?.[k]])
      )
})

const currentText = computed(()=>{ return targetTexts?.value?.[current.value] })
const targetLang = computed<string>(()=>route.params.lang as string)
const projects = computed(()=>store.projects)
const project = computed((): Project => {
  return projects.value.filter((p: Project) => {
    return p.id === route.params.id;
  })[0];
})
const voice = ref<SpeechSynthesisVoice>(undefined as unknown as SpeechSynthesisVoice)
const speech = useSpeechSynthesis(currentText, {
  voice,
  lang: targetLang,
  pitch: 1,
  rate: 1,
  volume: 1,
})


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

async function doTranslate(key: string, lang: string, provider?: PROVIDERS) {
  await translate(key, lang, provider)
  $history.value.commit()
}

async function updateText(key: string, value = '') {
  targetTexts.value[key] = value.trim();
  $history.value.commit()
}

function onInputFocus(key: string) {
  current.value = key;
}

function focusInput(e: MouseEvent ,key: string) {
  current.value = key;
  nextTick(()=>{
    const row: any = e.currentTarget;
    const input = row ? row.querySelector('.q-field__native') : null;
    input?.focus();
  })
}

function initHistory() {
  const id = `${props.id}-${props.lang}`
  let history = $historyList[id]
  if (!history) {
    history = $historyList[id] = useHistory(targetTexts)
  }
}

async function init() {
  store.activeId = props.id
  initHistory();
  await localeStore.loadProjectLocale(props.id)
}

init()
onMounted(()=>{
  watch(
    [()=>props.id, ()=>props.lang],
    ()=>{
      init()
    }
  )

  watch(()=>route.params.lang, ()=>{
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
  }, { immediate: true})
})

onUnmounted(() => {
  Object.keys($historyList).forEach(id=>{
    $historyList[id].clear()
    delete $historyList[id]
  })
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
  background-color: var(--p-bg);

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
      background-color: rgba(123, 123, 123, 0);
    }

    &:nth-child(odd) {
      background-color: rgba(123, 123, 123, 0.1);
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
