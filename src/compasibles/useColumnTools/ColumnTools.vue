<template>
  <q-tr class="q-table-column-tools">
    <q-td v-for="col in columns" :key="col._id" :class="{
      [`cell-${col._id}`]: true,
      [`cell-${col._key}`]: true,
      [`tools-${col._key}`]: true
    }">
      <div class="flex justify-start" v-if="col._key!=='editor'">
        <q-btn flat round size="sm" icon="svguse:#pl-translate" @click="onIconClick('translate', col)"></q-btn>
        <q-btn flat round size="sm" icon="svguse:#pl-save" @click="onIconClick('save', col)"></q-btn>
        <q-btn flat round size="sm" icon="svguse:#pl-hide" @click="onIconClick('hide', col)"></q-btn>
        <q-btn flat round size="sm" icon="svguse:#pl-delete" @click="onIconClick('delete', col)"></q-btn>
      </div>
    </q-td>
  </q-tr>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { PropType } from 'vue';

type ToolKey = 'translate' | 'save' | 'hide' | 'delete'
const emit = defineEmits(['translate', 'save', 'hide', 'delete'] as ToolKey[])
const props = defineProps({
  columns: {Type: Array as PropType<T[]>, required: true, default: ()=>[] as T[]}
})

function onIconClick(key: ToolKey, column: any) {
  emit(key, column)
}

</script>

<style lang="scss">
.q-table-column-tools {
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
