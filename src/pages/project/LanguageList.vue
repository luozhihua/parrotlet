<template>
  <q-page v-if="store.activeId" class="page-project-details">
    <portal to="toolbar-left">
      <q-breadcrumbs>
        <template v-slot:separator>
          <q-icon size="1em" name="svguse:#pl-arrow-right" style="color: rgba(123,123,123,0.7)" />
        </template>
        <q-breadcrumbs-el icon="svguse:#pl-back" :to="{ name: 'projects' }" />
        <q-breadcrumbs-el :icon="`img:${project.logo}`" :label="project.name" />
      </q-breadcrumbs>
    </portal>
    <portal to="toolbar-center">
      <q-table-keyword v-model="keyword" v-model:case-sensitive="caseSensitive"></q-table-keyword>
      <q-btn flat round dense no-caps size="md"
        :icon="`svguse:#pl-${!pagination.sortBy ? 'sort' : pagination.descending ? 'desc' : 'asc'}`"
        :color="pagination.sortBy ? 'primary' : ''">
        <q-popup-proxy>
          <q-list bordered separator style="width: 320px">
            <q-item clickable v-ripple v-for="(compare, key) in compares" :key="key" @click="toggleSortOptions(key)"
              :class="{
                'text-primary': pagination.sortBy === key,
                'text-bold': pagination.sortBy === key,
              }">
              <q-item-section>{{ compare }}</q-item-section>
              <q-item-section side>
                <q-btn-toggle push dense v-if="pagination.sortBy === key" v-model="pagination.descending"
                  toggle-color="primary" :options="[
                    {label: '', value: true, slot: 'desc'},
                    {label: '', value: false, slot: 'asc'},
                  ]" @click.stop>
                  <template v-slot:desc>
                    <q-icon name="svguse:#pl-desc" />
                  </template>
                  <template v-slot:asc>
                    <q-icon name="svguse:#pl-asc" />
                  </template>
                </q-btn-toggle>
              </q-item-section>
            </q-item>
            <q-item clickable v-ripple v-close-popup @click="toggleSortOptions()" :class="{
                'text-red': true,
                'p-bg1': true,
                'text-bold': !pagination.sortBy,
              }">
              <q-item-section>
                <q-btn rounded dense block flat icon="svguse:#pl-clear" class="q-my-md p-bg0">
                  {{ $t('Clear sort status') }}
                </q-btn>
              </q-item-section>
              <!-- <q-item-section side>
                <q-icon name="" color="red"></q-icon>
              </q-item-section>
              <q-item-section>
                {{ $t('Clear sort status') }}
              </q-item-section> -->
            </q-item>
          </q-list>
        </q-popup-proxy>
      </q-btn>
      <q-btn @click="$router.push({name:'project-translator'})" flat round dense icon="svguse:#pl-robot" no-caps>
        <q-tooltip>{{$t('Batch Translator')}}</q-tooltip>
      </q-btn>
      <q-btn-toggle v-model="layout" dense rounded unelevated xoutline xpush xglossy size="md" toggle-color="primary"
        color="grey-1" text-color="black" padding="0px 14px" class="layout-toggle" :options="[
            {value: 'grid', icon: 'svguse:#pl-grid'},
            {value: 'table', icon: 'svguse:#pl-table'},
            // {value: 'bars', icon: 'svguse:#pl-bars'},
            // {value: 'column', icon: 'svguse:#pl-column'},
          ]">
      </q-btn-toggle>
    </portal>
    <portal to="toolbar-right">
      <q-btn @click="$router.push({ name: 'project-editor', params: { id: project.id } });" flat round dense
        icon="svguse:#pl-project-settings" no-caps>
        <q-tooltip>{{$t('Project settings')}}</q-tooltip>
      </q-btn>
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

    <q-table :grid="layout==='grid'" flat :rows="rows" :columns="columns" row-key="_key" :filter="keyword"
      :hide-header="layout==='grid'" hide-pagination :card-container-class="cardContainerClass"
      v-model:pagination="pagination" :rows-per-page-options="rowsPerPageOptions">

      <template v-if="layout==='table'" v-slot:body-cell="props">
        <q-td :key="props.row._id + props.col.name" v-bind="props.col" :class="{
            [`cell-${props.row._key}-${props.col.name}`]: true,
            [`row-${props.row._key}`]: true,
            [`col-${props.col.name}`]: true,
          }" @mousedown="gotoTranslator(props.row.lang)">
          <span v-html="props.value"></span>
        </q-td>
      </template>

      <template v-if="layout==='table'" v-slot:body-cell-flag="props">
        <q-td :key="props.row._key + props.col.name" v-bind="props.col" :class="{
            [`cell-${props.row._key}-${props.col.name}`]: true,
            [`row-${props.row._key}`]: true,
            [`col-${props.col.name}`]: true,
          }" @mousedown="gotoTranslator(props.row.lang)">
          <FlagIcon round :code="props.row.lang" style="display: inline-block; width: 24px; height: 24px" />
        </q-td>
      </template>

      <template v-if="layout==='table'" v-slot:body-cell-progress="props">
        <q-td :key="props.row._key + props.col.name" v-bind="props.col" :class="{
            [`cell-${props.row._key}-${props.col.name}`]: true,
            [`row-${props.row._key}`]: true,
            [`col-${props.col.name}`]: true,
          }" @mousedown="gotoTranslator(props.row.lang)">
          <comp-translate-process :progress="props.value()" track-color="grey-8" class="q-mt-md" rounded :thickness="0.12"
            style=" margin: auto" />
        </q-td>
      </template>
      <template v-if="layout==='table'" v-slot:body-cell-editor="props">
        <q-td :key="props.row._key + props.col.name" v-bind="props.col" :class="{
            [`cell-${props.row._key}-${props.col.name}`]: true,
            [`row-${props.row._key}`]: true,
            [`col-${props.col.name}`]: true,
          }" @mousedown="gotoTranslator(props.row.lang)">
          <q-btn icon="svguse:#pl-edit" :label="$t('Edit')" size="sm" dense flat rounded></q-btn>
        </q-td>
      </template>

      <template v-if="layout==='grid'" v-slot:item="{row}">
        <div class="q-pa-xs col col-xs-4 col-sm-3 col-md-2 col-lg-2 col-xl-1">
          <q-card shadowed bordered class="xcard-target-langs q-pa-md " :class="{
              'cursor-not-allowed': row.isMain,
              'bg-primary': row.isMain,
              'text-white': row.isMain,
            }" @click="gotoTranslator(row.lang)">
            <q-card-section class="text-center justify-center items-center no-padding">

              <comp-translate-process :progress="localeStore.getProgress(project.id, row.lang)" track-color="grey-8"
                circle class="q-mt-md" size="80px" :thickness="0.12" style=" margin: auto">
                <FlagIcon round :code="row.lang" style="display: inline-block; width: 60px; height: 60px; " />
              </comp-translate-process>
              <div class="q-mt-md">
                <p class="ellipsis no-margin">{{ row.name }}</p>
                <p class="text-grey-6 no-margin">({{ row.lang }})</p>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </template>
    </q-table>
  </q-page>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import FlagIcon from '../../components/FlagIcon.vue';
import CompTranslateProcess from '../../components/TranslateProcess.vue';
import {Project, useProjectStore} from '../../stores/useProjectStore'
import useStick from '../../compasibles/useSticky'
import { QCard, useQuasar } from 'quasar';
import { useLocaleStore } from '../../stores/useLocaleStore'
import useQTableFilter from '../../compasibles/useTableFilter'

const localeStore = useLocaleStore()
const store = useProjectStore()
const route = useRoute()
const router = useRouter()
const { t: $t} = useI18n()
const { keyword, QTableKeyword, caseSensitive } = useQTableFilter()

useStick({
  element: '#projectInfo',
  target: '#stickyTrigger',
  className: 'sticking'
})

type SortBy = 'localeName' | 'code' | 'name' | 'progress'
const $projectInfo = ref<QCard |null>(null)
const layout = ref('table')
const projects = computed(()=>store.projects)
const project = computed(()=>{
  const id = route.params.id;
  return projects.value.filter((proj: Project) => (proj.id === id))[0];
})

const $q = useQuasar()
const pagination = ref({
  page: 1,
  rowsPerPage: 0,
  descending: false,
  sortBy: 'progress' as SortBy
})

const cardContainerClass = computed(() => {
  return $q.screen.gt.xs
    ? 'grid-masonry grid-masonry--' + ($q.screen.gt.sm ? '3' : '2')
    : ''
})

const rowsPerPageOptions = computed(() => {
  return $q.screen.gt.xs
    ? $q.screen.gt.sm ? [ 3, 6, 9 ] : [ 3, 6 ]
    : [3]
})

type Compare = {
  [K in SortBy]: string
}
const compares: Compare = {
  code: $t('Sort by locale code'),
  name: $t('Sort by language name'),
  localeName: $t('Sort by language locale name'),
  progress: $t('Sort by trranslation progress'),
}

const rows = computed(()=>{
  return project.value.enabledLanguages.map((lang)=>{
    return {
      _key: lang,
      lang,
      name: $t(`localeNames.${lang}`),
      progress: ()=>project.value ? localeStore.getProgress(project.value?.id, lang) : 0,
      isMain: lang === project.value?.language
    }
  })
})
const columns = computed<any>(()=>{
  return [
    {
      name: 'flag',
      field: (row: any) => row._key,
      label: '',
      align: 'left',
      style: 'width: 40px',
    },
    {
      field: (row: any) => row.name,
      label: $t('Language'),
      name: 'name',
      sortable: true,
      align: 'left',
      style: 'width: 100px',
    },
    {
      field: (row: any) => row.name,
      label: $t('Locale Language'),
      name: 'localeName',
      sortable: true,
      align: 'left',
      style: 'width: 100px',
      format(val: any, row: any){ return $t(`localeNames.${row.lang}`, 1, {locale: row.lang}) as string }
    },
    {
      field: (row: any) => row.lang,
      label: $t('Language code'),
      name: 'code',
      sortable: true,
      align: 'left',
      style: 'width: 60px',
    },
    {
      field: 'progress',
      label: $t('Translate progress'),
      name: 'progress',
      sortable: true,
      align: 'left',
      style: 'width: 100px',
      sort(a: any, b: any) {
        let A = a(), B=b()
        return A > B ? 1 : A<B ? -1:0
      }
      // format(val: any, row: any) {
      //   return localeStore.getProgress(project.value.id, row._key)
      // }
    },
    {
      field: '_key',
      label: '',
      name: 'editor',
      sortable: false,
      align: 'right',
      style: 'width: auto',
    }
  ]
})

function toggleSortOptions(sortBy?: SortBy) {
  if (!sortBy) {
    pagination.value.sortBy = null as any
  } else {
    pagination.value.sortBy = sortBy as SortBy
    pagination.value.descending = !pagination.value.descending
  }
}

function gotoTranslator(lang: string) {
  if (lang !== project.value.language) {
    const params = { project: project.value.id, lang };
    router.push({ name: 'project-translator-lang', params})
  }
}

onMounted(async ()=>{
  watch(
    ()=>route.params.id as string,
    async (id)=>{
      store.activeId = id
      await localeStore.loadProjectLocale(project.value?.id)
    },
    { immediate: true }
  )
})
</script>

<style lang="scss">
.page-project-details {
  font-family: unset;

  .q-table__container {
    height: calc(100% - 74px);
    overflow: auto;

    .q-card {
      background-color: rgba(var(--p-bg1-rgb), 0.5);

      &,
      .q-circular-progress {
        transition: 0.2s;
      }

      &:hover {
        background-color: rgba(var(--p-bg0-rgb), 0.5);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(0, 0, 0, 0.08), 0 6px 2px -7px rgba(0, 0, 0, 0.08);

        .q-circular-progress {
          transform: scale(1.05);
        }
      }

    }
  }

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

  .q-table {
    thead {
      position: sticky;
      top: 0;
      z-index: 4;
      background-color: var(--p-bg1);

      tr {
        height: 26px;
      }

      th {
        padding: 2px 16px;
      }
    }
  }

  .card-target-langs {
    height: 160px;

    &:hover {
      opacity: 0.9 box-shadow 0 0 5px $primary background-color rgba-opacity(--p-primary-rgb, 0.3);
    }
  }
}

.layout-toggle {
  margin-left: 6px;

  .q-btn {
    margin: 2px 0;
  }
}
</style>
