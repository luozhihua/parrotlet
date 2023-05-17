<template>
  <div class="q-table-keyword">
    <q-input ref="$input" v-model.trim="keyword" @update:model-value="(v: any)=>emit('update:modelValue', v)"
      :debounce="400" clearable outlined rounded dense>
      <template v-slot:prepend>
        <q-icon name="svguse:#pl-search" dense round flat size=".8em" @mouseup="$input?.focus()" />
      </template>
      <template v-slot:append>
        <q-icon name="svguse:#pl-case" dense round flat size=".8em" :class="{
          'text-primary': cases
        }" @mousedown="()=> cases = !cases" @mouseup="$input?.focus()" @click="emit('update:caseSensitive', cases)" />
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">
import { QInput } from 'quasar';
import { ref, watch } from 'vue';

const emit = defineEmits(['update:modelValue', 'update:caseSensitive'])
const props = defineProps({
  modelValue: {type: String, required: true},
  caseSensitive: {type: Boolean, required: false, default: false},
})

const $input = ref<QInput|null>(null)
const keyword = ref(props.modelValue)
const cases = ref(props.caseSensitive)

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
        padding-right: 4px;
        padding-left: 4px;
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

    }

    .q-field__append {
      display: none;
    }

    .q-icon {
      color: var(--p-fg);
    }
  }
}
</style>
