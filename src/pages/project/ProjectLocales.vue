<template>
  <q-page class="app-page page-project-details no-scroll">

    <portal to="toolbar-left">
      <!-- <q-btn icon="arrow_back" dense round @click="$router.back()" />
      <q-avatar class="q-mx-md" size="1.2em">
        <img v-if="project.logo" :src="project.logo" alt="">
        <q-icon v-else name="folder"></q-icon>
      </q-avatar>
      <span class="text-subtitle2">{{ project.name }}</span> -->

      <q-breadcrumbs>
        <template v-slot:separator>
          <q-icon size="1em" name="svguse:#pl-arrow-right" style="color: rgba(123,123,123,0.7)" />
        </template>
        <q-breadcrumbs-el icon="svguse:#pl-back" :to="{ name: 'project-details' }" />
        <q-breadcrumbs-el :label="$t('projects')" :to="{ name: 'projects' }" />
        <q-breadcrumbs-el :icon="`img:${project.logo}`" :label="project.name" :to="{ name: 'project-details' }" />
        <q-breadcrumbs-el :label="$t('All locale texts')" />
      </q-breadcrumbs>
    </portal>
    <portal to="toolbar-center">
    </portal>
    <portal to="toolbar-right">
      <QTableKeyword v-model="keyword" v-model:case-sensitive="caseSensitive" />
      <q-btn flat dense round icon="local_cafe" :xlabel="$t('translate empty fields automaticlly')"
        @click="translateEmptyFields()" class="" />
      <q-btn flat dense round icon="save" :xlabel="$t('save')" @click="save()" class="" />

      <ColumnToggle v-model="visibleColumns" :columns="columns" :always="[project.language, 'editor']" />

      <q-btn flat round dense icon="format_line_spacing" :color="!dense ? 'primary' : ''" @click="dense = !dense"
        class="" />
      <q-btn round dense icon="svguse:#pl-filter" :flat="!filterVisible"
        :color="filterVisible||Object.keys(filter).length>0 ? 'primary' : ''" @click="filterVisible = !filterVisible"
        class="">
        <q-badge color="positive" floating transparent v-if="Object.keys(filter).length>0">
          {{ Object.keys(filter).length }}
        </q-badge>
      </q-btn>
    </portal>

    <div class="app-page-main">
      <q-table ref="$table" :rows="rows" row-key="_id" :columns="columns" :dense="dense" separator="cell"
        column-sort-order="ad" :sort-method="sort" binary-state-sort :pagination="pagination"
        :visible-columns="visibleColumns" virtual-scroll :virtual-scroll-sticky-size-start="28"
        :virtual-scroll-item-size="28" :loading="loading" @virtual-scroll="onTableScroll" :filter="filter"
        :filter-method="filterMethod">

        <!-- 表头 thead -->
        <template v-slot:header="props">
          <q-tr :props="props" class="q-table-header">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" :auto-width="false" header :class="{
              resizable: col.resizable !== false,
              sortable: col.sortable,
              [`cell-${col.name}`]: true,
              [`th-${col.name}`]: true,
            }" :style="{textAlign: col.align, width: col.width, minWidth: col.minWidth}" @click="onThClick(col)">
              <div class="cell-wrapper flex content-center items-center" v-if="col.field !== 'editor'">
                <FlagIcon :code="col.name" square width="1em" height="1em" class="q-mr-xs" />
                <span>
                  {{ col.field === 'editor' ? '' : (col.label || col.name) }}
                </span>
                <q-space></q-space>
                <q-btn flat round size="sm" icon="svguse:#pl-menu" width="1.1em" class="col-tools-btn"
                  @mousedown.stop="activeTh=col.name" style="min-width: 1.8em; min-height: 1.8em;"
                  :color="columnToolsVisible&&activeTh===col.name ? 'primary':''" @click.stop></q-btn>
              </div>
              <span @mousedown='resizeColumn' @touchstart='resizeColumn' class="resize-handler"></span>
            </q-th>
          </q-tr>
        </template>

        <template v-slot:top-row="{cols}">
          <QTableFilter v-show="filterVisible" v-model="filter" :columns="cols" v-model:case-sensitive="caseSensitive">
          </QTableFilter>
        </template>
        <template v-slot:body-cell="{row, col, value}">
          <q-td :key="row._id + col.name" :class="{
              [`cell-${row._id}-${col._id}`]: true,
              [`cell-${row._id}`]: true,
              [`cell-${col._key}`]: true,
              'active-cell': activeCell?.row._id===row._id && activeCell?.col._id==col._id
            }" @mousedown="onCellClick({row, col, value})">
            <span v-html="value"></span>
          </q-td>
        </template>

        <template #pagination>
          <q-pagination v-model="pagination.page"
            :max="Math.ceil(($table?.computedRowsNumber || rows.length) / pagination.rowsPerPage)" direction-links dense
            size="sm" flat color="grey" active-color="primary" @update:model-value="$table?.setPagination(pagination)" />
        </template>
      </q-table>

      <q-dialog :value="translateProcess > 0" position="top">
        <q-card style="width: 500px">
          <q-linear-progress :value="translateProcess" color="primary" />

          <q-card-section class="row items-center no-wrap">
            <div>
              <div class="text-weight-bold">The Walker</div>
            </div>
            <q-space />
            <q-btn flat round icon="fast_rewind" />
            <q-btn flat round icon="pause" />
            <q-btn flat round icon="fast_forward" />
          </q-card-section>
        </q-card>
      </q-dialog>

      <q-popup-proxy v-model="cellEditorVisible" :target="`.cell-${activeCell?.row._id}-${activeCell?.col._id}`"
        ref="$cellEditor" persistent no-parent-event @hide="activeCell=null" :offset="[8,1]" class="p-bg cell-editor">

        <div class="q-pa-md p-bg1 info" style="min-width: 320px;">
          <q-field :label="$t(`localeNames.${project.language}`) + ' - (' + $t('primary-language') + ')'" stack-label
            readonly borderless>
            <template v-slot:prepend>
              <FlagIcon :code="project.language" square width="24px" height="24px" />
            </template>
            <template v-slot:control>
              <div class="self-center full-width no-outline" tabindex="0">
                {{texts?.[project.language]?.[activeCell?.row._key]}}
                <q-btn flat round dense size="sm" color="primary" icon="svguse:#pl-speak"
                  @click="speak(texts?.[project.language]?.[activeCell?.row._key], project.language)" />
              </div>
            </template>
          </q-field>

          <q-separator></q-separator>

          <q-field :label="$t(`localeNames.${activeCell?.col._key}`)" stack-label readonly borderless>
            <template v-slot:prepend>
              <FlagIcon :code="activeCell?.col._key" square width="24px" height="24px" />
            </template>
            <template v-slot:control>
              <div class="self-center full-width no-outline" tabindex="0">
                {{activeCell?.value}}
                <q-btn flat round dense size="sm" color="primary" icon="svguse:#pl-speak"
                  @click=" speak(activeCell?.value, activeCell?.col._key)" />
              </div>
            </template>
          </q-field>
        </div>

        <div class="q-pa-md p-bg input">
          <q-input v-if="activeCell" :type="activeCell?.value?.length > 15 ? 'textarea' : 'text'"
            :label="$t('Please enter new text')" stack-label :rows="Math.ceil(activeCell?.value?.length / 15)"
            :model-value="activeCell?.tmp ?? activeCell?.value" autofocus outlined label-color="primary" bottom-slots
            @update:model-value="(v)=>activeCell!.tmp = v"
            @keyup.ctrl.enter="saveCellValue(activeCell?.col.name, activeCell?.row._key);"
            @keyup.meta.enter="saveCellValue(activeCell?.col.name, activeCell?.row._key);">
            <template v-slot:prepend>
              <q-icon name="svguse:#pl-edit" color="primary"></q-icon>
            </template>
          </q-input>

          <div>
            <div v-if="engineTranslation">
              {{ engineTranslation }}
              <q-btn dense rounded color="primary" size="sm" @click="useEngineTranslation">{{ $t('Use')}}</q-btn>
            </div>

            <template v-for="provider in providers" :key="provider.key">
              <q-btn dense v-if="provider.enable" flat round size="sm" :icon="`svguse:#pl-${provider.key}`"
                :loading="!!translateToInputLoading"
                @click="translateToInput(texts?.[project.language]?.[activeCell?.row?._key], activeCell?.col._key, project.language, provider.key)">
                <q-tooltip>
                  {{ upperFirst($t(provider.name)) }}
                </q-tooltip>
              </q-btn>

            </template>
          </div>
        </div>

        <div class="flex q-pa-md justify-end p-bg2 sticky-bottom">
          <q-btn color="primary" @click="saveCellValue(activeCell?.col.name, activeCell?.row._key);"
            icon="svguse:#pl-check">
            <span class="q-mr-sm">{{$t('confirm')}}</span>
            <span class="text-lowercase text-weight-light text-grey-5 text-caption">(Ctrl + Enter)</span>
          </q-btn>
          <q-space></q-space>
          <q-btn :label="$t('cancel')" flat v-close-popup @click="$cellEditor?.hide()" />
        </div>
      </q-popup-proxy>

      <q-popup-proxy v-model="columnToolsVisible" :target="`.th-${activeTh} .col-tools-btn`" anchor="bottom end"
        self="top end" :offset="[8,5]">
        <div class="q-px-sm q-py-none">
          <q-btn flat round size="sm" icon="svguse:#pl-translate"></q-btn>
          <q-btn flat round size="sm" icon="svguse:#pl-save"></q-btn>
          <q-btn flat round size="sm" icon="svguse:#pl-hide"></q-btn>
          <q-btn flat round size="sm" icon="svguse:#pl-delete"></q-btn>
        </div>
      </q-popup-proxy>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import flatten, {unflatten} from 'flat';
// import * as fs from 'fs';
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
// import translate, { TranslateOptions } from '../../util/translator';
// import { moduleNames } from '../../store/modules';
import { QMenu, QPopupProxy, QTable, debounce, throttle } from 'quasar';
import { Project, useProjectStore } from '../../stores/useProjectStore';
import { electron } from '../../util/electron';
import { kebabCase, upperFirst } from 'lodash-es'
import FlagIcon from '../../components/FlagIcon.vue'
import useProvider from '../../compasibles/useProvider';
import { PROVIDERS } from '../../../src-electron/translator/constants';
import plimit from 'p-limit'
import useQTableFilter from '../../compasibles/useTableFilter'
// import useColumnTools from '../../compasibles/useColumnTools'
import useColumnToggle from '../../compasibles/useColumnToggle'
import useSpeak from '../../compasibles/useSpeak'

// const $q = useQuasar()
const limit = plimit(6)
const store = useProjectStore()
// const router = useRouter()
const route = useRoute()
const {t:$t} = useI18n()
const { providers } = useProvider()
const { speak, voice, matchLangs } = useSpeak()
const { QTableFilter, QTableKeyword, filter, filterVisible, filterMethod, keyword, caseSensitive } = useQTableFilter()
// const { ColumnTools } = useColumnTools()

const fs = electron.getFs()

const $cellEditor = ref<QPopupProxy|null>(null)
// const languages = ref<string[]>([])
const texts = ref<Record<string, any>>({})
const dense = ref(true)
const engineTranslation = ref('')
const loading = ref(true)
const columnToolsVisible = ref(false)
// const visibleColumns = ref<any[]>([])
const translateProcess = ref(0)
const activeTh = ref('')
const activeCell = ref<{
  value: any;
  tmp?: string | number | null;
  row: Record<string, any>;
  col: Record<string, any>;
} | null>(null)
const cellEditorVisible = ref(false)
const $table = ref<QTable|null>(null)
// const filter = ref<Record<string, any>>({})
const pagination = reactive({
  sortBy: '_id',
  descending: false,
  page: 1,
  rowsPerPage: 50
  // rowsNumber: xx if getting data from a server
})

// const projects = computed(()=>store.getters[`${moduleNames.projects}/projects`])

const project = computed((): Project=> {
  const id = route.params.id;
  return store.projects.filter((proj: Project) => (proj.id === id))[0];
})

const columns = computed((): any => {
  const { language, enabledLanguages } = project.value;
  const _columns = enabledLanguages.map((lang: string, i) => ({
    _id: `col-${i}-${kebabCase(lang)}`,
    _key: lang,
    name: lang,
    label: $t(`localeNames.${lang}`),
    field: lang,
    align: 'left',
    width: '200px',
    sortable: true,
    required: lang === language,
    classes: `col-lang-${lang}`,
    format: (val: any, row: any) => {
      // const fields = texts.value[lang];
      // return fields ? fields[row._id] : '';
      const kw = keyword.value;
      const filterText = filter.value[lang];

      if (kw || filterText) {
        const hignlights = []
        if (kw?.length>1) {hignlights.push(kw)}
        if (filterText?.length>1) {hignlights.push(filterText)}
        const reg = new RegExp(`(${hignlights.join('|')})`, `g${caseSensitive.value===true?'':'i'}`)
        console.log('filter reg', reg)
        return val.replace(reg, (a:string)=>`<b class="text-primary">${a}</b>`)
      } else {
        return val;
      }
    },
    })
  );

  _columns.push({
    _id: 'editor',
    _key: 'editor',
    name: 'editor',
    field: 'editor',

    align: 'right',
    width: '100px',
    sortable: false,
    label: ''
  } as any)

  return _columns;
})

const rows = computed((): any[] => {
  const { language, enabledLanguages} = project.value;
  const textsOfPrimaryLang = texts.value[language];
  const keys = textsOfPrimaryLang ? Object.keys(textsOfPrimaryLang) : []

  return keys
    .map((key, i)=>{
      const fields = Object.fromEntries(enabledLanguages.map((l)=>[l, texts.value[l]?.[key]||'']))
      return {
        _id: `row-${i}-${kebabCase(key)}`,
        _key: key,
        ...fields
      };
    })
})
const { visibleColumns, ColumnToggle } = useColumnToggle(columns)

async function translate(text: string, target: string, source:string = project.value.language, provider?: PROVIDERS) {
  return await (
    provider ?
      electron.translateByEngine(provider, text, target, source) :
      electron.translate(text, target, source)
  )
}

let translateToInputLoading: PROVIDERS | undefined
async function translateToInput(text: string, target: string, source:string, provider?: PROVIDERS) {
  translateToInputLoading = provider
  engineTranslation.value = await translate(text, target, source, provider)
  translateToInputLoading = undefined
}

function useEngineTranslation() {
  if (engineTranslation.value && activeCell.value) {
    activeCell.value.tmp = engineTranslation.value
  }
}

function onThClick(col: any) {
  activeTh.value = col.name
}

function onCellClick({row, col, value}: Record<string, any>) {
  if (col._key === project.value.language) {
    return
  }
  activeTh.value = col.name
  activeCell.value = {row, col, value: row[col._key]}
  cellEditorVisible.value = true
  engineTranslation.value = ''
  nextTick(()=>{
    const menu = ($cellEditor.value?.currentComponent?.ref as QMenu)
    menu?.updatePosition()

    setTimeout(()=>{
      menu?.focus()
    },200)
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function sort(rows: readonly any[], sortBy:string, descending: boolean) {
  const data = [...rows]
  pagination.sortBy = sortBy
  pagination.descending = descending
  if (sortBy) {
    data.sort((a, b) => {
      const x = descending ? b : a
      const y = descending ? a : b
      return x[ sortBy ] > y[ sortBy ] ? 1 : x[ sortBy ] < y[ sortBy ] ? -1 : 0
    })
  }
  return data
}

// function onCellEditorInput (value: string, oldValue: string) {
//   console.log('Input', oldValue, ' ===> ', value)
// }
// function onCellEditorCancel (value: string, oldValue: string) {
//   console.log('Cancel', oldValue, ' ===> ', value)
// }
// function onCellEditorSave (value: string, oldValue: string) {
//   console.log('Save', oldValue, ' ===> ', value)
// }

function saveCellValue(lang: string, key: string) {
  texts.value[lang][key] = activeCell.value?.tmp || activeCell.value?.value;
  cellEditorVisible.value = false
  nextTick(()=>{
    activeCell.value = null
  })
}

function translateText (text: string, target: string, source?: string) {
  return electron.translate(text, target, source);
}

function translateEmptyFields () {
  const { language: baseLanguage, enabledLanguages } = project.value;
  const fields = Object.keys(texts.value[baseLanguage]);
  let curr = 0;
  const translate = async () => {
    const field = fields[curr];
    const baseText: string = texts.value[baseLanguage][field];
    if (field) {
      const promises: Promise<any>[] = [];
      enabledLanguages.forEach((lang: string) => {
        const text = texts.value[lang]?.[field] || '';
        if (lang !== baseLanguage && !text) {
          const prom = limit(()=>translateText(baseText, lang, baseLanguage).then(
            (translation) => {
              if (translation) {
                texts.value[lang][field] = translation;
              }
            },
            (err: Error)=>{
              console.log(err)
            }
          ));
          promises.push(prom);
        }
      });
      await Promise.all(promises);
      curr += 1;
      if (curr < fields.length) {
        translate();
      }
    }
  };
  translate();
}

const onTableScroll = throttle(function() {
  const menu = ($cellEditor.value?.currentComponent?.ref as QMenu)
  menu?.updatePosition()
}, 200)

function save () {
  const { path, language, enabledLanguages } = project.value;
  enabledLanguages.forEach((lang: string) => {
    const filePath = `${path}/${lang}.json`;

    if (lang !== language) {
      const content = unflatten(texts.value[lang]);
      fs.writeFileSync(filePath, JSON.stringify(content, null, 4), 'utf8');
      console.log(`Save to ${filePath}`, content);
    }
  });
}

function getEventX (event: any) {
  let evt;
  if (event.changedTouches && event.changedTouches.length > 0) {
    evt = event.changedTouches[0];
  } else if (event.touches && event.touches.length > 0) {
    evt = event.touches[0];
  } else {
    evt = event;
  }
  return evt.clientX || evt.x;
}

function resizeColumn (event: any) {
  let offsetX = 0;
  const startX = getEventX(event); // event.clientX || event.x;
  const $handler = event.target || event.srcElement;
  const $cell = $handler.parentNode;
  const $table = $cell.parentNode.parentNode.parentNode;
  const $middle = $table.parentNode;
  const $ruler = document.createElement('div');
  const startWidth = $cell.offsetWidth;
  const tableLeft = $middle.getBoundingClientRect().left;

  $ruler.classList.add('fw-table-resize-ruler');
  $middle.appendChild($ruler);
  document.body.classList.add('fw-table-resizing-overlay');

  const onMouseMove = (e: any) => {
    const endX = getEventX(e);
    const cellLeft = ($cell.getBoundingClientRect().left - tableLeft) + 70;

    $ruler.style.left = Math.max(cellLeft, endX - tableLeft) + $middle.scrollLeft + 'px';
    // $ruler.style.left = Math.max(cellLeft, endX - tableLeft) + 'px';
  };

  const onMouseUp = (e: any) => {
    const endX = getEventX(e);

    offsetX = startX - endX;

    $cell.style.width = Math.max(70, startWidth - offsetX) + 'px';
    $middle.removeChild($ruler);
    document.body.classList.remove('fw-table-resizing-overlay');
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('touchmove', onMouseMove);
    document.removeEventListener('touchend', onMouseUp);
  };

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('touchmove', onMouseMove);
  document.addEventListener('touchend', onMouseUp);

  onMouseMove(event);
}

watch(()=> !!activeCell.value, (visible)=>{
  nextTick(()=>{
    if (visible) cellEditorVisible.value = true
  })
})

// watch(()=>filter.value, ()=>{
//   debugger
//   $table.value?.firstPage()
// },{deep:true})

onMounted(async () => {
  const { path, language, enabledLanguages } = project.value;
  const missing: string[] = [];

  visibleColumns.value = [...enabledLanguages, 'editor'];

  await Promise.all(
    enabledLanguages.map(async (lang: string)=>{
      const filePath = `${path}/${lang}.json`;

      if (fs.existsSync(filePath)) {
        const fileContent = await fs.promises.readFile(filePath, 'utf8');
        try {
          if (fileContent) {
            texts.value[lang] = flatten(JSON.parse(fileContent));
          }
        } catch(err) {
          console.log('fileContent: ', filePath, fileContent);
        }
      } else {
        missing.push(lang);
      }
    })
  )
  loading.value = false
})
</script>

<style lang="scss">
// @import "../../css/quasar.variables";
@use 'sass:color';


.page-project-details {
  .q-table__card {
    background-color: $bg !important;
    background-color: var(--p-bg) !important;
  }

  .q-table {
    table-layout: fixed;
    border-collapse: separate;

    thead,
    tr,
    th,
    td {
      border-color: rgba(123, 123, 123, 0.2);
    }

    thead {
      position: sticky;
      z-index: 6;

      th {
        font-weight: bolder;
        opacity: 1;
        background-color: var(--p-bg2) !important;
        overflow: visible;
        border-left-width: 0px;
        border-right-width: 1px;

        &:last-child {
          border-left-width: 1px;
          border-right-width: 0px;
        }

        &:first-child:after,
        &:last-child:before {
          content: ' ';
          display: block;
          width: 1px;
          position: absolute;
          top: 100%;
          right: -1px;
          background: rgba(123, 123, 123, 0.2);
          bottom: 0;
          z-index: 99;
          height: calc(100vh - 162px);
          pointer-events: none;
        }

        &:last-child:before {
          left: -1px;
          right: unset;
        }

        .cell-wrapper {
          // opacity: 0.5;

          >* {
            vertical-align: middle;
          }
        }

        .q-table__sort-icon {
          position: absolute;
          right: 2em;
          top: 50%;
          margin-top: -0.5em;
        }
      }
    }

    tbody {
      td {
        background-color: $bg;
        background-color: var(--p-bg);
        border-left-width: 0px;
        border-right-width: 1px;

        &:last-child {
          border-left: 0px;
        }
      }
    }

    tr,
    tr:hover {
      background-color: $bg2;
      background-color: var(--p-bg2);

      td:first-child,
      th:first-child {
        background-color: $bg0;
        background-color: var(--p-bg0);
        // border-right: 1px solid rgba(123, 123, 123, 0.1);
      }
    }

    thead tr:first-child th:first-child,
    thead tr:first-child td:first-child,
    td:first-child {
      position: sticky;
      left: 0;
      z-index: 3;
    }

    thead tr:first-child th:first-child,
    thead tr:first-child td:first-child {
      top: 0;
      z-index: 5;
      box-shadow: none;
    }

    thead tr:first-child th:not(:first-child),
    thead tr:first-child td:not(:first-child) {
      position: sticky;
      left: auto;
      top: 0;
      z-index: 4;
    }

    thead tr:first-child th.cell-editor,
    thead tr:first-child td.cell-editor,
    td.cell-editor {
      position: sticky;
      right: 0;
    }

    td,
    th {
      overflow: hidden;
      text-overflow: ellipsis;
    }

    td.active-cell {
      // background-color: $primary;
      // color: #fff;
      outline: 1px solid $primary;
      background-color: $primary;
      color: #fff;
      border-radius: 1px;
      box-shadow: 0 0 4px 1px rgba(0, 0, 0, 0.3);
      position: relative;
      z-index: 2;
    }

    .q-virtual-scroll__padding {
      td {
        border-bottom: 1px solid var(--p-bg1);
      }
    }

    .q-table-header,
    .q-table-filter {

      th {
        padding: 4px 8px;
      }

      &,
      td {
        height: 28px;
      }

    }
  }

  .q-table__top {
    padding-top: 4px;
    padding-bottom: 4px;
  }

  .q-table__middle {
    height: calc(100vh - 149px);
    position: relative;
  }

  .q-table--dense {
    .q-table__middle {
      height: calc(100vh - 132px);
    }
  }

  .fw-table-resize-ruler {
    position: absolute;
    width: 1px;
    top: 0;
    bottom: 0;
    left: -10px;
    background-color: var(--q-primary);
    background-color: $primary;
    z-index: 10;
  }

  .resizable .resize-handler {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    width: 6px;
    cursor: col-resize;
    transition: 0.5s;
    background-color: rgba(0, 0, 0, 0);
  }

  th.resizable:hover,
  td.resizable:hover {
    .resize-handler {
      background-color: rgba(123, 123, 123, 0.4);
    }
  }
}

.cell-editor {
  border: 6px solid $primary;

  .input {
    border-top: 2px dashed var(--q-primary);
    border-bottom: 2px dashed var(--q-primary);
  }
}
</style>
