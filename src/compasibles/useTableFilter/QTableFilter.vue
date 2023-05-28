<template>
  <q-tr class="q-table-filter">
    <q-td v-if="selection !== 'none'" class="text-center">
      <q-icon name="svguse:#pl-filter" size="xs"></q-icon>
    </q-td>
    <q-td v-for="col in columns" :key="col._id" :class="{
      [`cell-${col._id}`]: true,
      [`cell-${col._key}`]: true,
      [`filter-${col._key}`]: true
    }">
      <div class="flex justify-between">
        <q-input v-model.trim="filter[col._key]" v-if="col._key!=='editor'" :debounce="300" clear-icon="svguse:#pl-close"
          outlinedx dense clearable borderlessx xfilled>
          <template v-slot:prepend>
            <q-icon name="svguse:#pl-search" size="xs" class="q-ml-sm" style="font-size: 14px; margin-top: 1px"></q-icon>
          </template>
          <!-- <template v-slot:append>
            <q-icon name="svguse:#pl-case" dense round flat size=".8em" :class="{
              'text-primary': cases
            }"/>
          </template> -->
        </q-input>

        <div v-else class="text-right full-width q-pr-md">
          <q-btn flat round dense size="sm" icon="svguse:#pl-case" :color="cases?'primary':''"
            @mousedown="()=> cases = !cases" @click="emit('update:caseSensitive', cases)"></q-btn>
          <q-btn flat round dense size="sm" @click="()=> Object.keys(filter).forEach(k=>filter[k]='')"
            icon="svguse:#pl-clear">
            <q-tooltip>{{$t('Clear all column filter')}}</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-td>
  </q-tr>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { PropType, onActivated, onMounted, reactive, watch, ref } from 'vue';

const emit = defineEmits(['update:modelValue', 'update:caseSensitive'])
const props = defineProps({
  columns: {Type: Array as PropType<T[]>, required: true, default: ()=>[] as T[]},
  selection: {Type: String as unknown as ('multiple' | 'single' | 'none'), default: 'multiple'},
  modelValue: {Type: Object as PropType<Record<string, any>>, required: true, default: ()=>({} as Record<string, any>)},
  caseSensitive: {type: Boolean, required: false, default: false},
})

const cases = ref(props.caseSensitive)
const filter = reactive({
  ...props.modelValue
})

watch(()=>filter, (filter)=>{
  Object.keys(filter) .forEach((key)=>{
    if (!filter[key]) {
      delete filter[key];
    }
  })
  emit('update:modelValue', filter)
}, {deep:true})

watch(()=>props.caseSensitive, (v)=>{
  cases.value = v
})

function focus() {
  const fi = Object.keys(filter)[0]
  if (fi) {
    document.querySelector(`.filter-${fi}`)?.scrollIntoView({behavior:'smooth' , block: 'center', inline: 'center'})
  }
}
onActivated(focus)
onMounted(focus)
</script>

<style lang="scss">
@use 'sass:color';

.q-table-filter {
  position: sticky;
  top: 49px;
  z-index: 5;

  td {
    border-bottom: 0px solid #8888;
    padding: 0 !important;
    // z-index: 10;

    &:not(:last-child) {
      background-color: rgba(var(--p-bg1-rgb), 0.8) !important;
    }

    &:first-child {
      color: #fff;
      background-color: rgba(var(--p-primary-rgb), 1) !important;
      z-index: 11;
    }

    &:last-child {
      z-index: 11;
      background-color: color.mix($primary, $bg1, $weight: 10%) !important;
      background-color: var(--p-primary-l) !important;
      box-shadow: inset 0 -1px 2px -1px rgba(0, 0, 0, 0.5) !important;
    }
  }

  .q-field--dense .q-field__control,
  .q-field--dense .q-field__marginal {
    height: 28px;
    ;
  }

  .q-field__append .q-icon {
    font-size: 16px;
  }
}

.selection-multiple,
.selection-single {
  .q-table {
    .q-table-filter td:nth-child(2) {
      color: #fff;
      // filter: grayscale(0.5);
      // background-color: rgba(var(--p-primary-rgb), 1) !important;
      background-color: color.mix($primary, $bg1, $weight: 10%) !important;
      background-color: var(--p-primary-l) !important;
    }
  }
}

.q-table--dense {
  .q-table-filter {
    top: 33px;
  }
}
</style>
