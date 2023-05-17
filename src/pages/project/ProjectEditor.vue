<template>
  <q-page class="app-page page-project-editor no-scroll">

    <portal to="toolbar-left">
      <!-- <q-bar dense> -->
      <q-breadcrumbs class="text-brown">
        <template v-slot:separator>
          <q-icon size="1em" name="svguse:#pl-arrow-right" style="color: rgba(123,123,123,0.7)" />
        </template>
        <q-breadcrumbs-el icon="svguse:#pl-back" :to="{ name: 'project-details' }" />
        <q-breadcrumbs-el :label="$t('home')" icon="home" :to="{ name: 'home' }" />
        <q-breadcrumbs-el :label="$t('projects')" icon="all_inbox" :to="{ name: 'projects' }" />
        <q-breadcrumbs-el :label="form.name" :icon="`img:${form.logo}`"
          :to="{ name: 'project-details', params:{id: route.params.id} }" v-if="route.params.id" />
        <q-breadcrumbs-el :label="$t(route.params.id ? 'edit' : 'create')" />
      </q-breadcrumbs>
      <!-- </q-bar> -->
    </portal>

    <div class="app-page-main q-pa-md">
      <q-stepper v-model="step" style="max-width: 800px; margin: auto" ref="$stepper" color="primary"
        inactive-color="grey-8" alternative-labels header-nav animated>
        <q-step icon="folder" class="q-px-lg" :name="1" :title="$t('project-infomations')" :disable="finished"
          :error="step > 1 && !isStep1Done" :done="step >= 1 && isStep1Done">
          <q-input v-model="form.path" :label="$t('project-location')">
            <template v-slot:append>
              <q-btn round dense flat icon="folder" @click="chooseFolder" />
            </template>
          </q-input>
          <q-input :label="$t('project-name')" icon="folder" v-model="form.name"></q-input>
          <q-field :label="$t('logo')" stack-label for="logoSelector">
            <div class="q-py-lg">
              <q-avatar rounded color="grey-6" size="64px" text-color="white">
                <img v-if="form.logo" :src="form.logo">
                <q-icon v-else name="folder"></q-icon>
              </q-avatar>
            </div>

            <input id="logoSelector" name="logoSelector" type="file" accept="image/*" v-show="false"
              @change="onFileChannge">
            <template v-slot:append>
              <q-icon name="photo_size_select_actual" />
            </template>
          </q-field>
          <q-input :label="$t('description')" icon="folder" type="textarea" v-model="form.description"></q-input>
        </q-step>

        <q-step :name="2" :title="$t('language-settings')" icon="language" class="q-px-lg"
          :disable="finished || !isStep1Done" :error="step > 2 && !isStep2Done" :done="step >= 2 && isStep2Done">

          <LanguageSelector v-model="form.language" :languages="allLocaleCodes" :label="$t('primary-language')" square
            emit-value map-options bottom-slots>
            <template v-slot:prepend>
              <q-icon name="flag" size="1.4em" color="primary" />
            </template>
            <template v-slot:hint>
              {{ $t('primary-language-field-tips') }}
            </template>
          </LanguageSelector>

          <div class="q-mt-xl q-mb-lg">
            <q-separator spaced />
          </div>

          <section v-if="form.enabledLanguages.length !== 0">
            <header class="text-subtitle2 q-mt-lg row justify-start">
              <q-icon name="playlist_add_check" size="1.8em" style="margin: 0 .4em 0 .2em;" color="positive" />
              <span>{{ $t('enabled-languages') }}</span>
            </header>
            <div class="q-mb-lg q-mt-sm" style="padding-left: 34px;">
              <q-chip v-for="lang in form.enabledLanguages" :key="lang" dense :removable="form.language!==lang"
                :outline="form.language===lang" :color="form.language===lang ? 'primary' : 'transparent'"
                :class="`lang__${lang} q-mr-md`" @remove="deleteEnabledLanguage(lang)">
                <FlagIcon :code="lang" :shadowed="false" square class="q-mr-xs" />
                <span>{{ lang ? $t(`localeNames.${lang}`) : lang }}</span>
              </q-chip>
            </div>
            <q-separator spaced />
          </section>

          <section v-if="deletingLanguages.length !== 0">
            <header class="text-subtitle2 q-mt-lg row justify-start">
              <q-icon name="delete_forever" size="1.8em" style="margin: 0 .4em 0 .2em;" color="warning" />
              <span>{{ $t('deleting-languages') }}</span>
            </header>
            <div class="q-mb-lg q-mt-sm" style="padding-left: 34px;">
              <!-- <q-banner color="warnning">

              </q-banner> -->
              <q-chip v-for="lang in deletingLanguages" :key="lang" removable dense outline color="warning"
                :class="`lang__${lang}`" @remove="cancelDeletingLanguage(lang)">
                <FlagIcon :code="lang" :shadowed="false" square class="q-mr-xs" />
                <span>{{ lang ? $t(`localeNames.${lang}`) : lang }}</span>
              </q-chip>
            </div>
            <q-separator spaced />
          </section>

          <section>
            <LanguageSelector v-model="availableLanguages" multiple :languages="allLanguageFilteredOptions2" stack-label
              label-color="primary" :label="$t('Adding language')" square emit-value map-options status-component="toggle"
              hide-dropdown-icon :chip="{color: 'primary', outline:true}">
              <template v-slot:prepend>
                <q-icon name="svguse:#pl-new" size="1em" color="primary" />
              </template>
              <template v-slot:append>
                <q-icon name="svguse:#pl-plus" size="0.8em" color="primary" class="bg-primary text-white"
                  style=" border-radius: 50%; padding: 6px" />
              </template>
            </LanguageSelector>
          </section>
        </q-step>

        <q-step class="q-px-lg" icon="assignment_turned_in" :name="3" :title="$t('confirm')"
          :disable="!isStep1Done || !isStep2Done">
          <section>
            <h6 class="no-margin q-py-md">{{ $t('infomations') }}</h6>
            <div class="row">
              <div class="col col-2 self-center">
                <q-avatar rounded filled size="80px" color="grey-5" text-color="white">
                  <img v-if="form.logo" :src="form.logo" alt="" />
                  <q-icon v-else name="folder" />
                </q-avatar>
              </div>
              <div class="col">
                <dl class="row justify-between">
                  <dt>{{ $t('project-name') }}</dt>
                  <dd>{{ form.name }}</dd>
                </dl>
                <dl class="row justify-between">
                  <dt>{{ $t('directory') }}</dt>
                  <dd>
                    {{ form.path }}
                    <q-btn dense flat round size="sm" @click="electron.showItemInFolder(form.path)"
                      icon="svguse:#pl-open">
                      <q-tooltip>Reveal in folder</q-tooltip>
                    </q-btn>
                  </dd>
                </dl>
                <dl class="row justify-between">
                  <dt>{{ $t('primary-language') }}</dt>
                  <dd>
                    {{ $t(`localeNames.${form.language}`) }}
                    <FlagIcon :code="form.language" :shadowed="false" square class="q-ml-sm" />
                  </dd>
                </dl>
                <dl class="row justify-between">
                  <dt>{{ $t('description') }}</dt>
                  <dd>{{ form.description }}</dd>
                </dl>
              </div>
            </div>
          </section>

          <section v-if="form.enabledLanguages.length !== 0">
            <q-separator space />
            <h6 class="no-margin q-py-md">{{ $t('enabled-languages') }}</h6>
            <dl class="waiting-row row justify-between" v-for="lang in form.enabledLanguages" :key="lang">
              <dt>
                <q-icon name="check" color="grey-8"></q-icon>
                <span class="text-caption text-weight-light">{{ $t('directory') }}/</span>
                <span>
                  {{ lang }}.json
                </span>
                <q-btn dense flat round size="sm" @click="electron.showItemInFolder(`${form.path}/${lang}.json`)"
                  icon="svguse:#pl-open">
                  <q-tooltip>Reveal in folder</q-tooltip>
                </q-btn>
              </dt>
              <dd>
                {{ $t(`localeNames.${lang}`) }}
                <FlagIcon :code="lang" :shadowed="false" square class="q-ml-sm" />
              </dd>
            </dl>
          </section>

          <section v-if="(form.language && !isLanguageEnabled(form.language)) || availableLanguages.length !== 0">
            <q-separator space />
            <h6 class="no-margin q-py-md">{{ $t('added-languages') }}</h6>
            <dl class="waiting-row row justify-between text-positive"
              v-if="form.language && !isLanguageEnabled(form.language) && !availableLanguages.includes(form.language)">
              <dt>
                <q-icon name="add" color="positive"></q-icon>
                <span class="text-caption text-weight-light">{{ $t('directory') }}/</span>
                <span class="text-weight-bolder">
                  {{ form.language }}.json
                </span>
                <q-btn dense flat round size="sm" @click="electron.showItemInFolder(`${form.path}/${form.language}.json`)"
                  icon="svguse:#pl-open">
                  <q-tooltip>Reveal in folder</q-tooltip>
                </q-btn>
              </dt>
              <dd>
                <q-icon name="flag" color="primary"></q-icon>
                {{ $t(`localeNames.${form.language}`) }}
                <FlagIcon :code="form.language" :shadowed="false" square class="q-ml-sm" />
              </dd>
            </dl>

            <dl class="waiting-row row justify-between text-positive" v-for="lang in availableLanguages" :key="lang">
              <dt>
                <q-icon name="add" color="positive"></q-icon>
                <span class="text-caption text-weight-light">{{ $t('directory') }}/</span>
                <span>
                  {{ lang }}.json
                </span>
                <q-btn dense flat round size="sm" @click="electron.showItemInFolder(`${form.path}/${lang}.json`)"
                  icon="svguse:#pl-open">
                  <q-tooltip>Reveal in folder</q-tooltip>
                </q-btn>
              </dt>
              <dd>
                {{ $t(`localeNames.${lang}`) }}
                <FlagIcon :code="lang" :shadowed="false" square class="q-ml-sm" />
              </dd>
            </dl>
          </section>

          <section v-if="deletingLanguages.length !== 0">
            <q-separator space />
            <h6 class="no-margin q-py-md">{{ $t('deleting-languages') }}</h6>
            <dl class="waiting-row row justify-between text-negative" v-for="lang in deletingLanguages" :key="lang">
              <dt>
                <q-icon name="remove" color="negative"></q-icon>
                <span class="text-caption text-weight-light">{{ $t('directory') }}/</span>
                <span>
                  {{ lang }}.json
                </span>
                <q-btn dense flat round size="sm" @click="electron.showItemInFolder(`${form.path}/${lang}.json`)"
                  icon="svguse:#pl-open">
                  <q-tooltip>Reveal in folder</q-tooltip>
                </q-btn>
              </dt>
              <dd>
                {{ $t(`localeNames.${lang}`) }}
                <FlagIcon :code="lang" :shadowed="false" square class="q-ml-sm" />
              </dd>
            </dl>

            <div class="q-py-lg">
              <q-checkbox v-model="agreeDelete" :label="$t('agree-delete-lang-label')" keep-color color="warning" />
            </div>
          </section>
        </q-step>

        <template v-slot:navigation>
          <q-stepper-navigation>
            <div class="row justify-start q-px-lg q-pt-lg">
              <q-btn @click="onContinueBtnClick" :disable="finishing || isContinueBtnDisabled" color="primary"
                :label="step === 3 ? $t('finish') : $t('continue')" />
              <q-btn v-if="step > 1" flat color="grey-9" class="q-ml-sm" :label="$t('back')" :disable="finished"
                @click="$stepper?.previous()" />
            </div>
          </q-stepper-navigation>
        </template>
      </q-stepper>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import {ref, reactive, computed, onMounted } from 'vue'
import lrz from 'lrz';
import UniqueId from 'short-unique-id';
import * as baseLangTexts from '../../i18n/langs/zh-CN.json';
import { Project } from '../../stores/useProjectStore';
import {useRouter, useRoute} from 'vue-router'
import {useI18n} from 'vue-i18n'
import {QStepper, useQuasar} from 'quasar'
import { electron } from '../../util/electron';
import { useProjectStore } from '../../stores/useProjectStore';
import LanguageSelector from '../../components/LanguageSelector.vue'
import FlagIcon from '../../components/FlagIcon.vue'

const $q = useQuasar()
const { t: $t } = useI18n()
const store = useProjectStore()
const router = useRouter()
const route = useRoute()
const $stepper = ref<QStepper|null>(null)
const fs = electron.getFs()

const Uid = new UniqueId();
const allLocaleCodes = Object.keys(baseLangTexts.localeNames);
type QSelectOptions = {
  label: string;
  value: string;
};

const step = ref(1)
const agreeDelete = ref(false)
const finished = ref(false)
const finishing = ref(false)
const fileExecutionResults = ref<string[]>([])
// const creatingDialog = ref(false)
const deletingLanguages = ref<string[]>([])
const availableLanguages = ref<string[]>([])
const allLanguagesFilterKeywords = ref('')
const form = reactive<Project>({
  id: new UniqueId().randomUUID(8),
  path: '',
  name: '',
  logo: '',
  language: '',
  description: '',
  enabledLanguages: [] as string[],
})

const projects = computed(()=>store.projects)
// const settings = computed(()=>store.getters[`${moduleNames.settings}/settings`])

const isStep1Done = computed( (): boolean => {
  const { id, name, path, } = form;
  return (id?.length >= 8) && (name?.length > 2) && (!!path);
})

const isStep2Done = computed((): boolean =>{
  const { language } = form;
  return !!language && allLocaleCodes.includes(language);
})

// const isStep3Done = computed((): boolean =>{
//   return finished.value
// })

const isContinueBtnDisabled=computed((): boolean =>{
  if (step.value === 1) {
    return !isStep1Done.value
  } else if (step.value === 2) {
    return !isStep2Done.value
  } else if (step.value === 3) {
    return finished.value || (deletingLanguages.value.length > 0 && !agreeDelete.value)
  } else {
    return false;
  }
})

const finnalyLanguages = computed((): string[] => {
  const all = [
    ...form.enabledLanguages,
    // ...availableLanguages.value
  ];
  return all.filter(lang => !deletingLanguages.value.includes(lang))
})

// const enabledLanguageOptions = computed((): QSelectOptions[] => {
//   return finnalyLanguages.value.map((lang: string) => ({
//     label: $t(`localeNames.${lang}`) as string,
//     value: lang,
//   }));
// })

const allLanguageOptions = computed((): QSelectOptions[] => {
  return allLocaleCodes.map(locale => ({
    label: $t(`localeNames.${locale}`) as string,
    value: locale,
  }));
})

const allLanguageFilteredOptions = computed((): QSelectOptions[] => {
  return allLocaleCodes.map(locale => ({
    label: $t(`localeNames.${locale}`) as string,
    value: locale,
  }))
    .filter(lang => !finnalyLanguages.value.includes(lang.value))
    .filter(lang => (!allLanguagesFilterKeywords.value || lang.label.includes(allLanguagesFilterKeywords.value)));
})
const allLanguageFilteredOptions2 = computed((): string[] => {
  return allLocaleCodes
    .filter(lang => !finnalyLanguages.value.includes(lang))
    .filter(lang => (!allLanguagesFilterKeywords.value || lang.includes(allLanguagesFilterKeywords.value)));
})

function add(project: Project) {
  store.add(project)
}

function update(project: Project) {
  store.update(project)
}

// function remove(projectId: string) {
//   store.commit(`${moduleNames.projects}/remove`, projectId)
// }

function isLanguageEnabled (lang: string) {
  return form.enabledLanguages.includes(lang);
}


// function allLanguagesFilter (val: string, update: Function, /*abort: Function*/) {
//   allLanguagesFilterKeywords.value = val;
//   update();
// }

// function onReset () {
//   form.id = Uid.randomUUID(8)
// }

function onFileChannge (event: any) {
  const file = event.target.files[0];

  lrz(file, { width: 480, height: 480 })
    .then((rst: Record<string, any>) => {
      form.logo = rst.base64;
      // console.log(rst.base64);
    })
    // .catch(err => {
    //   console.log(err);
    // })
    .always(() => {
      // 不管是成功失败，都会执行
    });
}

function deleteEnabledLanguage (lang: string) {
  const code = Uid.randomUUID(4).toLowerCase();
  // const msg = 'Deleting an existing language will remove the locale file from the project directory and cannot be recovered. If you already know that this is a very dangerous operation, please enter the red verification code yourself to continue deleting, otherwise click the Cancel button.';
  const msg = $t('delete-exists-lang-warning-msg');
  const message = `${msg} <br/> <span class="q-py-xs q-px-lg q-mt-md text-red text-h5" style="display:inline-block; border-radius: 40px; user-select:none; background-color: rgba(127,127,127,0.1);">${code}</span>`;

  $q.dialog({
    title: $t('delete-exists-lang-warning-title') as string,
    message,
    prompt: {
      model: '',
      type: 'text' // optional
    },
    html: true,
    cancel: {
      label: $t('cancel'),
      rounded: true,
      filled: false,
      flat: true,
      noCaps: true,
      color: 'black'
    },
    ok: {
      rounded: true,
      filled: true,
      noCaps: true,
      className: 'q-px-xl',
      icon: 'delete_forever',
      label: $t('delete-it', [$t(`localeNames.${lang}`)]),
      color: 'negative'
    },
    persistent: false
  }).onOk((data: string) => {
    if (data === code) {
      form.enabledLanguages = form.enabledLanguages.filter(item => item !== lang);
      deletingLanguages.value.push(lang);
    } else {
      $q.dialog({
        title: $t('confirm') as string,
        message: $t('incorrect-verification-code') as string,
        persistent: true,
        cancel: {
          label: $t('cancel'),
          flat: true,
        },
        ok: {
          className: 'q-px-xl',
          icon: 'redo',
          label: $t('retry'),
          color: 'primary'
        },
      }).onOk(() => {
        deleteEnabledLanguage(lang);
      });
    }
  });
}

function onContinueBtnClick () {
  if (step.value === 3 && (deletingLanguages.value.length === 0 || agreeDelete)) {
    finishing.value = true;
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    finish();
  } else {
    $stepper.value?.next();
  }
}

function cancelDeletingLanguage (lang: string) {
  form.enabledLanguages.push(lang);
  deletingLanguages.value = deletingLanguages.value.filter(item => item !== lang);
}

function deleteAvailableLanguage (lang: string) {
  availableLanguages.value = availableLanguages.value.filter(item => item !== lang);
}

function addLanguageToAvailableList () {
  $q.dialog({
    title: $t('add-languages') as string,
    // message: 'Choosed language will adding to project.',
    class: 'add-lang-dialog',
    options: {
      type: 'toggle',
      model: [],
      // inline: true,
      items: allLanguageFilteredOptions.value
    },
    cancel: true,
    persistent: false
  }).onOk((data: any) => {
    if (data && data.length > 0) {
      availableLanguages.value.push(...data);
    }
  });
}

// function addProjectAndCloseDialog () {
//   add(form);
//   Object.keys(form).forEach((k)=> (delete (form as any)[k]) )
//   creatingDialog.value = false;
// }


function getLangs (filePath: string) {
  const files: string[] = fs.readdirSync(filePath);
  return (
    files
      .filter(file => /\.json/.test(file))
      .filter(file => !/languages\.json/.test(file))
      .map(file => file.replace(/\.json$/, ''))
  );
}

async function chooseFolder () {
  const filePaths = await electron?.openFileDialog({
    title: '选择 Vue-i18n 的语言目录',
    properties: ['openDirectory'],
  });

  const filePath = filePaths[0];
  if (filePath) {
    form.enabledLanguages = getLangs(filePath);
    form.path = filePath;
  }
}

function createFile () {
  const newFiles = [...availableLanguages.value];

  if (!form.enabledLanguages.includes(form.language)) {
    newFiles.unshift(form.language);
  }

  newFiles.forEach(lang => {
    const filePath = `${form.path}/${lang}.json`;
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '{}', 'utf8');
    // } else {
      // console.log(`File: ${filePath} exists.`);
    }
    fileExecutionResults.value.push(lang);
  });
}

function deleteFile () {
  deletingLanguages.value.forEach((lang: string) => {
    if (!availableLanguages.value.includes(lang)) {
      const filePath = `${form.path}/${lang}.json`;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      fileExecutionResults.value.push(lang);
    }
  });
}

function gotoList () {
  $q.dialog({
    title: $t('prompt') as string,
    message: (route.params.id ? $t('modify-project-success') : $t('add-project-success')) as string,
  }).onDismiss(() => {
    router.replace({ name: 'projects' })
  });
}

function finish () {
  const finnalyLangs = [form.language, ...form.enabledLanguages, ...availableLanguages.value];
  const langs = Array.from(new Set(finnalyLangs));

  try {
    deleteFile();
    createFile();
    form.enabledLanguages = langs.sort((a, b) => b.indexOf(form.language));
    if (route.params.id) {
      update(form);
    } else {
      add(form);
    }
    finished.value = true;
    gotoList();
  } catch (err) {
    // console.log(err);
    finishing.value = false;
  }
}

onMounted( ()=> {
  const { id } = route.params
  if (id) {
    const proj = projects.value.filter((proj: Project) => (proj.id === id))[0];

    if (proj) {
      Object.assign(form, JSON.parse(JSON.stringify(proj)))
    }
  }
})
</script>

<style lang="stylus">
.page-project-editor {

  >.q-card {
    height calc(100% - 32px)
  }

  .btn-add-project {
    position: sticky;
    bottom: 0px;
  }

  .waiting-row {
    margin 2px 0
    color rgba(123, 123, 123, 1)
  }

  .q-field__messages.col {
    padding-left: 45px;
  }
}

.add-lang-dialog {
  .q-card__section.scroll {
    max-height: calc(100vh - 200px)
  }
}
</style>
