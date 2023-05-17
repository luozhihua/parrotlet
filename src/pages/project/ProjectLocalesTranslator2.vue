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
      <dl class="row item no-padding" v-for="(text,key) in baseTexts" :key="key" :class="{ current: current === key }"
        :data-key="key" :data-text="text" @click="focusInput">

        <!-- 主语言 -->
        <dt class="col-xs-6 relative-position q-px-md no-margin text-right justify-end"
          :class="text.length > 15 ? 'content-start  q-py-sm' : 'items-center'">
          <q-btn color="primary" :icon="`svguse:#pl-menu`" rounded>
            <q-popup-proxy>
              <div class="text-grey-5 text-weight-thin text-caption">{{ key }}</div>
            </q-popup-proxy>
          </q-btn>
          <q-space></q-space>
          <span>{{ text }}</span>
        </dt>

        <!-- 需翻译的语言 -->
        <dd class="col-xs-6 relative-position q-px-md no-margin justify-center"
          :class="text.length > 15 ? 'content-start' : 'items-center'">
          <q-input dense borderless :debounce="700" :model-value="targetTexts[key]"
            :type="text.length > 15 ? 'textarea': 'text'" rows="4" @focus="onInputFocus(key)"
            @input="updateText(key, '')" />

          <!-- 翻译小工具栏 -->
          <div class="translate-tools absolute-top-left fadeInRight">
            <q-btn-group class="no-shadow" outline>
              <q-btn dense flat size="sm" icon="svguse:#pl-robot" tabindex="-1"
                @click="translateByAllProviders(key, text,)">
                <q-tooltip anchor="top right" self="bottom middle" transition-show="scale" transition-hide="scale">
                  {{ $t('Translate') }}
                </q-tooltip>

                <q-menu :offset="[0, 0]" fit>
                  <q-list separator style="min-width: 100px">
                    <q-item v-for="provider in providers" :key="provider.key" :disable="!provider.enable">
                      <q-item-section avatar>
                        <q-avatar>
                          <q-icon :name="`svguse:#pl-${provider.key}`" />
                        </q-avatar>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label v-if="providerStatus[`${provider.key}_${key}`] === 'loading'">
                          <q-spinner-facebook color="primary" size="1em" />
                        </q-item-label>
                        <q-item-label v-else-if="providerTexts[`${provider.key}_${key}`]">{{
                          providerTexts[`${provider.key}_${key}`] }}</q-item-label>
                        <q-item-label caption>
                          <i style="font-size: 10px; color: rgba(123,123,123,1);"
                            v-html="$t('Translated by {provider}', {provider: provider.name})"></i>
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <div class="q-gutter-xs">
                          <q-btn dense size="sm" color="primary"
                            :disable="!providerTexts[`${provider.key}_${key}`] || providerStatus[`${provider.key}_${key}`] !== 'success'"
                            :label="$t('ok')" v-close-popup @click="updateText(key, provider.texts?.[key]?.text)" />
                        </div>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-btn-group>
          </div>
        </dd>
      </dl>
      <pre>{{providerTexts}}</pre>
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
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useStick from '../../compasibles/useSticky'

type ResultOfProvider = {
  [k in TranslateProviderNames]?: {
    result?: string;
    status: 'normal' | 'loading' | 'success' | 'error';
    provider: TranslateProviderNames;
  };
};
type ResultMapOfProvider = {
  [k: string]: ResultOfProvider;
};
type ProviderResult = {
  status: 'normal' | 'loading' | 'success' | 'error';
  text: string;
  provider: TranslateProviderNames;
}
type Provider = {
  key: PROVIDERS;
  name: string;
  enable: boolean;
  texts: {
    [k: string]: ProviderResult;
  };
}

const store = useProjectStore()
const transStore = useTranslateStore()
const router = useRouter()
const route = useRoute()
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
const currentTransResults = ref<ResultMapOfProvider>({})
const providerTexts = ref<Record<string,string>>({})
const providerStatus = ref<Record<string, 'normal' | 'loading' | 'success' | 'error'>>({})
const baseTexts = ref<Record<string, any>>({})
const targetTexts = ref<Record<string, any>>({})
const providers = computed<Provider[]>(()=>{
  const enabledProviders = transStore.engines
  return Object.values(PROVIDERS)
  .sort((a,b)=> enabledProviders.indexOf(b) - enabledProviders.indexOf(a) )
  .map(provider=>({
    key: provider,
    name: upperFirst(provider),
    enable: enabledProviders.includes(provider),
    texts: {}
  }))
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
  baseTexts.value = await loadTextsOfLang(project.value, project.value.language);
  targetTexts.value = await loadTextsOfLang(project.value, props.lang);
  const _counted = await countTranslateProcess(
    project.value,
    props.lang,
    { base: baseTexts.value, target: targetTexts.value}
  ) || { base: 0, target: 0, };
  Object.assign(counted, _counted)
}

function handleLanguageChange(lang: string) {
  router.push({
    params: {...route.params, lang},
    query: route.query,
  })
}

function translateEmpties() {
  console.log('TODO: translateEmpties()')
}

function save() {
  console.log('TODO: save()')
}

async function translate(i18nkey: string, text: string) {
  const result = await electron.translate(text, props.lang)
  await updateText(i18nkey, result)
}

async function translateText(provider: Provider, key: string, text: string,) {
  const commonKey = `${provider.key}_${key}`;

  try {
    providerStatus.value[commonKey] = 'loading';
    const translatedText = await electron.translateByEngine(provider.key, text, props.lang, project.value.language);

    providerTexts.value[commonKey] = translatedText
    provider.texts[key] = {text: translatedText, status: 'success', 'provider': provider.key};
    currentTransResults.value[key][provider.key] = { result: translatedText, status: 'success', 'provider': provider.key};
    providerStatus.value[commonKey] = 'success';
  } catch (err) {
    providerStatus.value[commonKey] = 'error';
  }
}
async function translateByAllProviders(i18nKey: string, text: string,) {
  await pWaterfall(
    transStore.engines.map((provider) => async() => {
      const commonKey = `${provider}_${i18nKey}`;
      if (!['loading', 'success'].includes(providerStatus.value[commonKey])) {
        const providerName = providers.value.find(k=>k.key===provider)
        providerName && await translateText(providerName, i18nKey, text);
      }
    })
  );
}

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
}

function focusInput(e: MouseEvent) {
  const row: any = e.currentTarget;
  const input = row ? row.querySelector('.q-field__native') : null;

  if (input) {
    input.focus();
  }
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
      background-color: rgba(123, 123, 123, 0.05);
    }

    &:nth-child(even) {
      background-color: rgba(123, 123, 123, 0.08);
    }

    &.current {
      position: sticky;
      top: 40px;
      bottom: 0px;
      z-index: 3;
      box-shadow: 2px 4px 6px 2px rgba(0, 0, 0, 0.4);
      border-radius: 10px;

      &,
      .q-field__native,
      .q-field__prefix,
      .q-field__suffix {
        color: #fff;
      }


      dt {
        border-right: 2px solid rgba(0, 0, 0, 0.2);
        border-radius: 10px 0 0 10px;
        backdrop-filter: blur(5px);
        background-color: rgba(123, 123, 123, 1);
        color: #fff;
      }

      dd {
        color: #fff;
        z-index: 2;
        background-color: $primary !important;
        background-color: var(--q-primary) !important;
        border-radius: 0 10px 10px 0;
      }

      .translate-tools {
        display: flex;
        left: 10px;
        height: 30px;
        top: -30px;
        padding: 2px 2px 2px .8em;
        z-index: 9999;
        box-shadow: 0px -1px 5px rgba(0, 0, 0, 0.5);
        border-radius: 10px 10px 0 0;
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
</style>
