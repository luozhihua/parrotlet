<template>
  <q-page class="page-project-details">

    <portal to="toolbar-left">
      <q-breadcrumbs>
        <template v-slot:separator>
          <q-icon size="1em" name="svguse:#pl-arrow-right" style="color: rgba(123,123,123,0.7)" />
        </template>
        <q-breadcrumbs-el icon="svguse:#pl-back" :to="{ name: 'projects' }" />
        <q-breadcrumbs-el :label="$t('projects')" :to="{ name: 'projects' }" />
        <q-breadcrumbs-el :icon="`img:${project.logo}`" :label="project.name" />
      </q-breadcrumbs>
    </portal>

    <portal to="toolbar-right">
      <q-btn-group rounded unelevated>
        <q-btn @click="$router.push({name:'project-translator'})" dense size="md" icon="translate"
          :label="$t('Batch Translator')" no-caps></q-btn>
        <q-btn @click="$router.push({ name: 'project-editor', params: { id: project.id } });" dense size="md"
          icon="settings" :label="$t('Project settings')" no-caps></q-btn>
      </q-btn-group>
    </portal>

    <!-- Project details -->
    <div id="stickyTrigger"><!--Keep for sticky detecting--></div>
    <q-card ref='$projectInfo' id="projectInfo" class="project-info p-bg2 no-border-radius" flat>
      <q-card-section horizontal>
        <q-card-section class="q-pt-xs flex flex-center">
          <q-card-section class="flex flex-start">
            <q-avatar v-if="project.logo" size="40px" class="q-mr-sm"><img :src="project.logo"
                :alt="project.name"></q-avatar>
          </q-card-section>
          <q-card-section class="q-pl-none">
            <h6 class="text-h6 q-mt-none q-pt-none q-pb-none q-mb-none">{{project.name}}</h6>
            <p class="no-margin text-weight-regular text-subtitle2">{{project.path}}</p>
            <div class="text-caption text-grey">{{project.description}}</div>
          </q-card-section>
          <q-space></q-space>
        </q-card-section>

        <q-space></q-space>
        <q-card-section class="col-3 column items-end">
          <FlagIcon :rounded="false" :code="project.language" style="display: inline-block; width: 48px; height: 36px; ">
          </FlagIcon>
          <div class="text-caption">{{ $t('primary-language') }}: {{$t(`localeNames.${ project.language }`)}}</div>
        </q-card-section>
      </q-card-section>
    </q-card>

    <q-separator></q-separator>

    <div class="language-list flex p-bg">
      <div class="row q-col-gutter-md q-pa-md" style="flex: 1;">
        <div v-for="lang in project.enabledLanguages" :key="lang"
          class="col col-xs-4 col-sm-3 col-md-2 col-lg-2 col-xl-1">
          <q-card class="card-target-langs q-pa-md no-border no-box-shadow bg-transparent" :class="{
              'cursor-not-allowed': lang === project.language,
              'bg-primary': lang === project.language,
              'text-white': lang === project.language,
            }" @click="gotoTranslator(lang)">
            <q-card-section class="text-center justify-center items-center no-padding">

              <comp-translate-process :project="project" :language="lang" track-color="grey-6" circle class="q-mt-md"
                size="80px" :thickness="0.05" style=" margin: auto">
                <FlagIcon round :code="lang" style="display: inline-block; width: 60px; height: 60px; " />
              </comp-translate-process>
              <div class="q-mt-md">
                <p class="ellipsis no-margin">{{ $t(`localeNames.${lang}`) }}</p>
                <p class="text-grey-6 no-margin">({{ lang }})</p>
              </div>

              <q-tooltip>{{ $t(`localeNames.${lang}`) }}</q-tooltip>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

  </q-page>
</template>


<script lang="ts" setup>
import pWaterfall from 'p-waterfall';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FlagIcon from '../../components/FlagIcon.vue';
import { countTranslateProcess } from '../../util/project';
import CompTranslateProcess from '../../components/TranslateProcess.vue';
import {Project, useProjectStore} from '../../stores/useProjectStore'
import useStick from '../../compasibles/useSticky'
import { QCard } from 'quasar';

const store = useProjectStore()
const route = useRoute()
const router = useRouter()

useStick({
  element: '#projectInfo',
  target: '#stickyTrigger',
  className: 'sticking'
})

const $projectInfo = ref<QCard |null>(null)
const counts = ref<Record<string, any>>({})
const projects = computed(()=>store.projects)
const project = computed(()=>{
  const id = route.params.id;
  return projects.value.filter((proj: Project) => (proj.id === id))[0];
})

function gotoTranslator(lang: string) {
  if (lang !== project.value.language) {
    const params = { project: project.value.id, lang };
    router.push({ name: 'project-translator-lang', params})
  }
}

// function getProcessColor(process?: TranslateProcess) {
//   if (!process || process.value < 0.5) {
//     return 'negative'
//   } else if (process.value >= 0.5 && process.value < 0.9) {
//     return 'warning'
//   } else {
//     return 'positive'
//   }
// }

async function loadProcesses() {
  await pWaterfall(
    project.value.enabledLanguages.map((lang:string) => async () => {
      const consted = await countTranslateProcess(project.value, lang);
      counts.value.lang = consted;
    })
  );
}


onMounted(()=>{
  loadProcesses();
})
</script>


<style lang="scss">
.page-project-details {
  font-family: unset;

  .project-info {
    position: sticky;
    top: 0;
    z-index: 1;
    // box-shadow: 0 0 1px 0px rgba(0, 0, 0, 0) !important;
    transition: box-shadow .3s;

    &.sticking {
      box-shadow: 0 0 5px rgba(0, 0, 0, 0.3) !important;
    }

    .q-card__section--vert {
      padding-top: 0;
      padding-bottom: 10px;
    }
  }

  .language-list {
    // height: calc(100vh - 175px);
    // overflow-y: auto;
  }

  .card-target-langs {
    height: 160px;

    &:hover {
      opacity: 0.9 box-shadow 0 0 5px $primary background-color rgba-opacity(--p-primary-rgb, 0.3);
    }
  }
}
</style>
