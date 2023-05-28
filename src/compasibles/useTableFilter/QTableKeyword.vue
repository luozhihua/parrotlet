<template>
  <div class="q-table-keyword">
    <q-input ref="$input" v-model.trim="keyword" @update:model-value="(v: any)=>emit('update:model-value', v)"
      :debounce="400" clearable outlined rounded dense>
      <template v-slot:prepend>
        <q-btn dense round flat size="md" @mouseup="$input?.focus()">
          <q-icon name="svguse:#pl-search" :color="keyword ? 'primary' : ''" />
          <q-badge v-if="keyword" floating color="red"></q-badge>
        </q-btn>
      </template>
      <template v-slot:append>
        <q-btn flat dense round size="sm" @mousedown="()=> cases = !cases" @mouseup="$input?.focus()"
          @click="emit('update:case-sensitive', cases)">
          <q-icon name="svguse:#pl-case" :class="{ 'text-primary': cases }" />
        </q-btn>
      </template>
    </q-input>
    <q-tooltip>{{ $t('Search contents') }}</q-tooltip>
  </div>
</template>

<script setup lang="ts">
import { QInput } from 'quasar';
import { ref, watch } from 'vue';

const emit = defineEmits(['update:model-value', 'update:case-sensitive'])
const props = defineProps({
  modelValue: {type: String, required: true},
  caseSensitive: {type: Boolean, required: false, default: false},
})

const $input = ref<QInput|null>(null)
const keyword = ref(props.modelValue)
const cases = ref(props.caseSensitive)

watch(()=>props.modelValue, (v)=>{
  keyword.value = v
})

watch(()=>props.caseSensitive, (v)=>{
  cases.value = v
})
</script>

<style lang="scss">
.q-table-keyword {
  $hei: 34px;

  position: relative;
  width: $hei;
  height: $hei;

  .q-field {
    position: absolute;
    right: 0;

    &--dense {

      .q-field__control,
      .q-field__marginal {
        height: $hei;
        padding-right: 0px;
        padding-left: 0px;
      }

      .q-field__native {
        width: 0px;
        transition: .2s;
      }
    }

    &--outlined {
      &:not(.q-field--focused) {
        .q-field__control:before {
          border-color: transparent;
          background-color: transparent;
          transition: .2s;
        }

        .q-field__control:hover:before {
          background-color: rgba(var(--p-fg-rgb), .1);
        }
      }


      .q-field__control:before {
        background-color: var(--p-bg);
      }
    }


    &--focused {

      .q-field__control {
        padding-right: 12px;
      }

      .q-field__native {
        width: 80px;
      }

      .q-field__append {
        display: flex !important;
      }

      .q-badge {
        display: none !important;
      }

    }

    .q-field__append {
      display: none;
    }

    .q-icon {
      color: var(--p-fg);
    }

    .q-badge {
      padding: 3px;
      min-height: 6px;

      &--floating {
        right: 0;
        top: 0;
      }
    }
  }
}
</style>
