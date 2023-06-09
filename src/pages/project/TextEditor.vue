<template>
  <q-page v-if="project" class="app-page page-project-texts no-scroll">
    <portal to="toolbar-left">
      <q-breadcrumbs>
        <template v-slot:separator>
          <q-icon size="1em" name="svguse:#pl-arrow-right" style="color: rgba(123,123,123,0.7)" />
        </template>
        <q-breadcrumbs-el icon="svguse:#pl-back" :to="{ name: 'projects' }" />
        <!-- <q-breadcrumbs-el :label="$t('projects')" :to="{ name: 'projects' }" /> -->
        <q-breadcrumbs-el :icon="`img:${project.logo}`" :label="project.name" />
        <!-- <q-breadcrumbs-el :label="$t('All locale texts')" /> -->
      </q-breadcrumbs>
    </portal>
    <portal to="toolbar-center">
      <div class="flex no-wrap">
        <q-btn flat round dense size="md" icon="svguse:#pl-undo" :disable="!canUndo" @click="undo()">
          <q-tooltip>{{$t('Undo')}}</q-tooltip>
        </q-btn>
        <q-btn flat round dense size="md" icon="svguse:#pl-redo" :disable="!canRedo" @click="redo()">
          <q-tooltip>{{$t('Redo')}}</q-tooltip>
        </q-btn>
        <q-btn flat dense round icon="svguse:#pl-save" :disable="!canUndo && !canRedo" :xlabel="$t('save')"
          @click="localeStore.saveAllLangs()">
          <q-tooltip>{{ $t('Save texts of all languages') }}</q-tooltip>
        </q-btn>
        <q-separator spaced vertical inset></q-separator>
        <q-btn flat dense round icon="svguse:#pl-robot" :xlabel="$t('Translate empty fields')"
          @click="localeStore.translateEmptyFieldsOfProject().finally(()=>commit())">
          <q-tooltip>{{ $t('Translate empty fields') }}</q-tooltip>
        </q-btn>
        <q-btn dense flat round size="md" icon="svguse:#pl-plus">
          <q-popup-proxy>
            <q-card style="min-width: 240px;">
              <q-card-section>
                <AddLanguage flat :dense="false" size="md" :round="false" :rounded="false" icon="svguse:#pl-language"
                  class="full-width" :label="$t('Add language')" @history="commit()">
                  <q-space></q-space>
                </AddLanguage>
                <q-separator></q-separator>
                <AddText flat :dense="false" size="md" :round="false" :rounded="false" icon="svguse:#pl-text"
                  class="full-width" :label="$t('Add text')" @history="commit()">
                  <q-space></q-space>
                </AddText>
              </q-card-section>
            </q-card>
          </q-popup-proxy>
        </q-btn>
      </div>
    </portal>
    <portal to="toolbar-right">
      <QTableKeyword v-model="keyword" v-model:case-sensitive="caseSensitive" />
      <q-btn round dense icon="svguse:#pl-filter" :flat="!filterVisible"
        :color="filterVisible||Object.keys(filter).length>0 ? 'primary' : ''" @click="filterVisible = !filterVisible">
        <q-badge color="positive" floating transparent v-if="Object.keys(filter).length>0">
          {{ Object.keys(filter).length }}
        </q-badge>
        <q-tooltip>{{ $t('Toggle filter tools') }}</q-tooltip>
      </q-btn>
      <ColumnToggle v-model="visibleColumns" :columns="columns" :always="[project?.language, 'editor']" />
      <q-btn flat round dense icon="format_line_spacing" :color="!dense ? 'primary' : ''" @click="dense = !dense">
        <q-tooltip>{{ $t('Toogle dense mode of grid') }}</q-tooltip>
      </q-btn>
    </portal>

    <div class="app-page-main">
      <q-table ref="$table" :rows="rows" row-key="_id" :columns="columns" :dense="dense" separator="cell"
        column-sort-order="ad" :sort-method="sort" binary-state-sort v-model:pagination="pagination"
        :visible-columns="visibleColumns" :virtual-scroll="true" :virtual-scroll-sticky-size-start="28"
        :virtual-scroll-item-size="28" :loading="loading" :filter="mergedFilter" :filter-method="filterMethod"
        :selection="selection" v-model:selected="selected" :rowsPerPageOptions="rowsPerPageOptions" :class="{
          [`selection-${selection}`]: true, 'no-shadow': true
        }">

        <!-- 表头 thead -->
        <template v-slot:header="props">
          <q-tr :props="props" class="q-table-header" :class="props.__trClass">
            <q-th v-if="selection!=='none'">
              <q-checkbox v-model="selectedAll" size="md" :dense="props.dense" />
            </q-th>
            <q-th v-for="col in props.cols" :key="col.name" :props="props" :auto-width="false" header :class="{
              resizable: col.resizable !== false,
              sortable: col.sortable,
              [`cell-${col.name}`]: true,
              [`th-${col.name}`]: true,
            }" :style="{textAlign: col.align, width: col.width, minWidth: col.minWidth}" @click="onThClick(col)">
              <div class="cell-wrapper flex content-center items-center" v-if="col.field !== 'editor'">
                <TranslateProcess :progress="localeStore.getProgress(project.id, col._key)" track-color="red"
                  class="q-mr-md self-center translate-progress" size="xs" style="width: 80px;" />
                <FlagIcon :code="col.name" square width="1em" height="1em" class="q-mr-xs" />
                <span class="column-title-text">
                  {{ col.field === 'editor' ? '' : (col.label || col.name) }}
                </span>
                <q-space></q-space>
                <q-btn flat round size="sm" icon="svguse:#pl-menu" width="1.1em" class="col-tools-btn"
                  @mousedown.stop="activeTh=col.name" style="min-width: 1.8em; min-height: 1.8em;"
                  :color="columnToolsVisible&&activeTh===col.name ? 'primary':''" @click.stop></q-btn>
                <ColumnResize />
              </div>
              <div v-else class="q-mr-sm">
                <AddLanguage @history="commit()" />
              </div>
            </q-th>
          </q-tr>
        </template>

        <template #header-selection="props">
          <q-checkbox v-model="selectedAll" size="sm" :dense="props.dense" />
        </template>

        <template v-slot:top-row="{cols}">
          <QTableFilter v-show="filterVisible" v-model="filter" :columns="cols" :selection="selection"
            v-model:case-sensitive="caseSensitive">
          </QTableFilter>
        </template>
        <template v-slot:body-cell="{row, col, value}">
          <q-td :key="row._id + col.name" :class="{
              [`cell-${row._id}-${col._id}`]: true,
              [`cell-${row._id}`]: true,
              [`cell-${col._key}`]: true,
              'text-right': col._key === 'editor',
              'active-cell': activeRow?._id===row._id && activeCol?._id==col._id
            }" @mousedown.left="col._key !== 'editor' && onCellClick({row, col, value})">
            <span v-if="col._key !== 'editor'" v-html="value"></span>
            <RowTools v-else :project-id="(route.params.id as string)" :text-key="row._key" @history="commit()" />
          </q-td>
        </template>

        <!-- <template #pagination>
          <q-pagination v-model="pagination.page" :max="pagesNumber" :max-pages="maxPages" direction-links dense size="sm"
            flat color="grey" active-color="primary" />
        </template> -->
        <template v-slot:bottom="">
          <q-checkbox v-model="selectedAll" size="md" :dense="dense" class="q-mr-xs" style="margin-left: 1px;" />
          <div v-if="selected?.length" class="q-mx-sm">
            {{ $t('Selected {pages} rows', {pages: selected?.length || 0}) }}
          </div>
          <q-separator v-if="selected?.length" vertical spaced />
          <SelectionTools :selected="selected" @history="commit()" />
          <q-separator vertical spaced />
          <AddText @history="commit()" />
          <q-space></q-space>
          <div>
            {{ $t('Rows per page:') }}
          </div>
          <q-select dense flat size="xs" v-model="pagination.rowsPerPage" :options="rowsPerPageOptions" class="q-mx-md">
            <template #option="props">
              <q-item @click="props.toggleOption(props.opt)" clickable v-ripple dense :class="{
                'bg-primary': props.selected,
                'text-white': props.selected,
              }">
                <q-item-section>{{ props.opt || $t('All') }}</q-item-section>
                <q-item-section side style="color: currentColor;">
                  <q-icon v-if="props.selected" name="svguse:#pl-check"></q-icon>
                </q-item-section>
              </q-item>
            </template>
            <template #selected-item="{opt}">
              <span>{{ opt||$t('All') }}</span>
            </template>
          </q-select>
          <q-pagination v-model="pagination.page" :max="pagesNumber" :max-pages="maxPages" direction-links dense size="sm"
            flat color="grey" active-color="primary" />
        </template>

        <template v-slot:no-date="{icon, message}">
          <div>
            <q-icon :name="icon"></q-icon>
            <span>{{ message }}</span>sss
          </div>
        </template>
      </q-table>
    </div>

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

    <TranslateDialog ref="$cellEditor" v-if="activeRow && activeCol" :model-value="activeRow[activeCol._key]"
      v-model:visible="cellEditorVisible" @update:model-value="saveCellValue" :row="activeRow" :col="activeCol"
      :base-text="project.language ? activeRow?.[project.language] : ''" :base-lang="project.language" />
    <ColumnTools v-model="columnToolsVisible" :lang="activeTh" @history="commit()" />
  </q-page>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { QMenu, QPopupProxy, QTable, QTableColumn, debounce } from 'quasar';
import { Project, useProjectStore } from '../../stores/useProjectStore';
import { useLocaleStore } from '../../stores/useLocaleStore';
import { kebabCase } from 'lodash-es'
import TranslateProcess from 'src/components/TranslateProcess.vue';
import FlagIcon from '../../components/FlagIcon.vue'
import RowTools from '../../components/RowTools.vue'
import SelectionTools from '../../components/SelectionTools.vue'
import ColumnResize from '../../components/ColumnResize.vue'
import AddText from '../../components/AddText.vue'
import AddLanguage from '../../components/AddLanguage.vue'
import useQTableFilter from '../../compasibles/useTableFilter'
import useColumnToggle from '../../compasibles/useColumnToggle'
import useHistory from '../../compasibles/useHistory'
import useColumnTools from '../../compasibles/useColumnTools'
import TranslateDialog from '../../components/TranslateDialog.vue'

// const $q = useQuasar()
const store = useProjectStore()
const localeStore = useLocaleStore()
// const router = useRouter()
const route = useRoute()
const {t:$t} = useI18n()
const { QTableFilter, QTableKeyword, filter, filterVisible, filterMethod, keyword, caseSensitive } = useQTableFilter()
const $cellEditor = ref<typeof TranslateDialog | null>(null)

localeStore.loadProjectLocale(route.params.id as string)
const mergedFilter = computed(()=>{
  return {filter: filter.value, keyword: keyword.value}
})
const dense = ref(true)
const loading = ref(true)
const selection = ref<'multiple' | 'single' | 'none'>('multiple')
const selected = ref<(typeof rows['value'])>([])
const selectedAll = computed({
  get() {
    let total = Math.min(pagination.value.rowsPerPage||1, $table.value?.computedRows?.length||Infinity)
    return selected.value.length === total
      ? true
      : (selected.value.length===0 ? false: null)
  },
  set(all) {
    if (all === true) {
      selected.value = [...($table.value?.computedRows||[])]
    } else {
      selected.value.length = 0
    }
  }
})
const translateProcess = ref(0)
const activeTh = ref('')
const activeRow = ref<Record<string, any> | null>(null)
const activeCol = ref<Record<string, any> | null>(null)
const cellEditorVisible = ref(false)
const $table = ref<QTable|null>(null)
const project = computed((): Project=> {
  const id = route.params.id;
  return store.projects.filter((proj: Project) => (proj.id === id))[0];
})
const texts = computed({
  get(){
    return localeStore.state.projects?.[project.value?.id] || {}
  },
  set(newTexts){
    Object.assign(localeStore.state.projects[project.value.id], newTexts)
  }
})
const {init: initHistory, source, commit, undo, redo, canUndo, canRedo} = useHistory(texts)
const rows = computed(()=>localeStore.allTextOfProject)
const columns = computed((): QTableColumn[] => {
  const { language, enabledLanguages=[] } = project.value||{};
  const _columns: QTableColumn[] = enabledLanguages.map((lang: string, i) => ({
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
    format: (val: any, _row: any) => {
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
    label: '',

    align: 'right',
    width: '60px',
    sortable: false
  } as any)

  return _columns;
})
const { visibleColumns, ColumnToggle } = useColumnToggle(columns)
const { ColumnTools, visible: columnToolsVisible } = useColumnTools()
const pagination = ref({
  sortBy: '_id',
  descending: false,
  page: 1,
  rowsPerPage: 50
})
const rowsPerPageOptions = ref([
  5,10,20,30,40,50,100,0
])
const maxPages = ref(8)
const pagesNumber = computed(() => {
  return !pagination.value.rowsPerPage ? 1 : Math.ceil(($table.value?.computedRowsNumber || rows.value.length) / pagination.value.rowsPerPage)
})

function onThClick(col: any) {
  activeTh.value = col.name
}

function onCellClick({row, col}: Record<string, any>) {
  if (col._key !== project.value.language) {
    activeTh.value = col.name
    activeRow.value = row
    activeCol.value = col
    cellEditorVisible.value = true
  }
}

function saveCellValue(value: string) {
  const lang = activeCol.value?._key
  const key = activeRow.value?._key
  const old = texts.value[lang][key]
  texts.value[lang][key] = value ?? '';
  cellEditorVisible.value = false
  nextTick(()=>{
    if (old !== value) {
      commit()
    }
    activeRow.value = activeCol.value = null
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function sort(rows: readonly any[], sortBy:string, descending: boolean) {
  const data = [...rows]
  // pagination.value.sortBy = sortBy
  // pagination.value.descending = descending
  if (sortBy) {
    data.sort((a, b) => {
      const x = descending ? b : a
      const y = descending ? a : b
      return x[ sortBy ] > y[ sortBy ] ? 1 : x[ sortBy ] < y[ sortBy ] ? -1 : 0
    })
  }
  return data
}

const onTableScroll = debounce(function() {
  const menu = ($cellEditor.value?.currentComponent?.ref as QMenu)
  menu?.updatePosition()
}, 400)

onMounted(async () => {
  const cancel = watch(()=>texts.value, (val, old)=>{
    console.log(val, Object.keys(val))
    if (Object.keys(val).length>1) {
      source.value = val
      initHistory()
      cancel()
    }
  }, {deep: true})

  watch(
    ()=>route.params.id as string,
    async (id, old)=>{
      store.activeId = id;
      loading.value = true
      await localeStore.loadProjectLocale(id)
      const { enabledLanguages } = project.value;
      visibleColumns.value = [...enabledLanguages, 'editor'];
      loading.value = false
    },
    {immediate:true}
  )

  watch([()=> pagination.value.page, ()=> pagination.value.rowsPerPage], ([page, rowsPerPage], [_page, _rowsPerPage])=>{
    selected.value.length = 0

    if (rowsPerPage!==_rowsPerPage) {
      pagination.value.page = 1
    }
  })

  watch(
    [()=> keyword.value, ()=>filter.value],
    ()=>{
      nextTick(()=>{
        // $table.value?.setPagination(pagination)
      })
    },
    {deep:true}
  )

  const table = document.querySelector('.q-table__middle')
  table?.addEventListener('scroll', onTableScroll)
})

onBeforeUnmount(()=>{
  const table = document.querySelector('.q-table__middle')
  table?.removeEventListener('scroll', onTableScroll)
})
</script>

<style lang="scss">
@use 'sass:color';

.page-project-texts {
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
          height: calc(100vh - 220px);
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

        .translate-progress {
          position: absolute;
          top: unset;
          left: 0;
          right: 0;
          width: 100% !important;
          bottom: -3px;
        }
      }
    }

    tbody {
      tr {
        &.selected {
          td:after {
            background-color: var(--q-primary);
            opacity: 0.1;
          }
        }
      }

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

    tr {
      background-color: $bg2;
      background-color: var(--p-bg2);

      td:first-child,
      th:first-child {
        background-color: $bg0;
        background-color: var(--p-bg0);
        width: 73px;
        // border-right: 1px solid rgba(123, 123, 123, 0.1);
      }
    }

    thead th:first-child,
    td:first-child {
      position: sticky;
      left: 0;
      z-index: 3;
    }

    thead th:first-child {
      top: 0;
      z-index: 5;
      box-shadow: none;
    }

    thead th:not(:first-child) {
      position: sticky;
      // left: auto;
      top: 0;
      z-index: 4;
    }

    thead th.cell-editor,
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
      outline: 1px solid var(--q-primary);
      background-color: var(--q-primary);
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

    .column-title-text {
      width: calc(100% - 49px);
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  .selection-multiple,
  .selection-single {

    thead th:nth-child(2) {
      z-index: 5;

      &:after {
        content: ' ';
        display: block;
        width: 1px;
        position: absolute;
        top: 100%;
        right: -1px;
        background: rgba(123, 123, 123, 0.2);
        bottom: 0;
        z-index: 99;
        height: calc(100vh - 220px);
        pointer-events: none;
      }
    }

    th:nth-child(2),
    td:nth-child(2) {
      position: sticky;
      left: 73px;
      z-index: 3;
    }

    td:nth-child(2) {
      background: var(--p-bg0) !important;
    }
  }

  .q-table__top {
    padding-top: 4px;
    padding-bottom: 4px;
  }

  .q-table__middle {
    height: calc(100vh - 172px);
    position: relative;

    &:has(+ .q-table__bottom--nodata) {
      height: unset !important;
    }
  }

  .q-table__bottom {
    &--nodata {
      justify-content: center;
      padding: 4em 1em;
      color: $warning;
    }
  }

  .q-table--dense {
    .q-table__middle {
      height: calc(100vh - 140px);
    }

    tr {

      td:first-child,
      th:first-child {
        width: 50px;
      }
    }

    thead {
      th {

        &:first-child:after,
        &:last-child:before {
          height: calc(100vh - 173px);
        }
      }
    }

    &.selection-multiple,
    &.selection-single {

      th:nth-child(2),
      td:nth-child(2) {
        left: 50px;
      }

      thead {
        th:nth-child(2):after {
          height: calc(100vh - 173px);
        }
      }
    }

  }

  .fw-table-resize-ruler {
    position: absolute;
    width: 1px;
    top: 0;
    bottom: 0;
    left: -10px;
    background-color: $primary;
    background-color: var(--q-primary);
    z-index: 10;
  }

  th.resizable:hover,
  td.resizable:hover {
    .column-resize {
      background-color: rgba(123, 123, 123, 0.4);
    }
  }
}


.cell-editor {
  border: 6px solid $primary;
  border: 6px solid var(--q-primary);

  .input {
    border-top: 2px dashed var(--q-primary);
    border-bottom: 2px dashed var(--q-primary);
  }
}
</style>
