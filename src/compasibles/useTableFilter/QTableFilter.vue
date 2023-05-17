<template>
  <q-tr class="q-table-filter">
    <q-td v-for="col in columns" :key="col._id" :class="{
      [`cell-${col._id}`]: true,
      [`cell-${col._key}`]: true,
      [`filter-${col._key}`]: true
    }">
      <div class="flex justify-between">
        <q-input v-model.trim="filter[col._key]" v-if="col._key!=='editor'" :debounce="300" clear-icon="svguse:#pl-close"
          size="xs" outlinedx dense clearable borderlessx xfilled>
          <template v-slot:prepend>
            <q-icon name="svguse:#pl-filter" size="xs" class="q-ml-sm"></q-icon>
          </template>
          <template v-slot:append>
            <q-icon name="svguse:#pl-case" dense round flat size=".8em" :class="{
              'text-primary': cases
            }" @mousedown="()=> cases = !cases" @click="emit('update:caseSensitive', cases)" />
          </template>
        </q-input>
      </div>
    </q-td>
  </q-tr>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { PropType, onActivated, onMounted, reactive, watch, ref } from 'vue';

const emit = defineEmits(['update:modelValue', 'update:caseSensitive'])
const props = defineProps({
  columns: {Type: Array as PropType<T[]>, required: true, default: ()=>[] as T[]},
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
.q-table-filter {
  position: sticky;
  top: 28px;
  z-index: 5;
  backdrop-filter: blur(2px);
  background-color: transparent !important;

  td {
    background-color: rgba(var(--p-bg1-rgb), 0.8) !important;
    border-bottom: 0px solid #8888;
    padding: 0 !important;
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
</style>
