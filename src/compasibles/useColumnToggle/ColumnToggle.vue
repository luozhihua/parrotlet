<template>
  <q-btn flat round dense icon="view_column" :color="menuVisible?'primary':''">
    <q-popup-proxy v-model="menuVisible" max-height="80vh">
      <section>
        <header class="q-px-md q-pt-md p-bg0 sticky-top">
          <q-option-group v-model="isAll" type="radio" :options="[
            {label: $t('Check all'), value: true},
            {label: $t('Uncheck all'), value: false},
          ]" />
        </header>
        <q-separator></q-separator>
        <q-list dense>
          <q-item v-for="col in columns" :key="col._key" :disable="always.includes(col._key)" tag="label" :class="{
                'text-primary': visibleColumns.includes(col._key)
              }">
            <q-item-section side>
              <FlagIcon :code="col._key" size="1.1em" square bordered />
            </q-item-section>
            <q-item-section>{{ $t(`localeNames.${col._key}`) }}</q-item-section>
            <q-item-section side>
              <q-toggle v-model="visibleColumns" :val="col._key" size="xs" :disable="always.includes(col._key)" />
            </q-item-section>
          </q-item>
        </q-list>
      </section>
    </q-popup-proxy>
  </q-btn>
</template>

<script setup lang="ts">
import { PropType, ref, watch } from 'vue';
import FlagIcon from '../../components/FlagIcon.vue'

const emit = defineEmits(['update:model-value'])
const props = defineProps({
  modelValue: {type: Array as PropType<any[]>, required: true},
  always: {type: Array as PropType<string[]>, default: ()=>[]},
  columns: {type: Array as PropType<any[]>, required: true }
})
const visibleColumns = ref(props.modelValue)
const isAll = ref(true)
const menuVisible = ref(false)

watch(()=>isAll.value, (isAll)=>{
  if (isAll) {
    visibleColumns.value = props.columns.map((col)=>col._key)
  } else {
    visibleColumns.value = [...props.always]
  }
})

watch(()=>props.modelValue, (v)=>{
  visibleColumns.value = v
})

watch(()=>visibleColumns.value, (v)=>{
  emit('update:model-value', v)
})


</script>
