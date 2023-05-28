<template>
  <q-select class="language-selector" v-bind="$attrs" :model-value="modelValue" borderless
    :multiple="multiple && Array.isArray(modelValue)"
    :placeholder="($attrs.placeholder as string) ?? $t('Filter languages')"
    :label="$attrs.label === null || $attrs.label?.trim() === '' ? undefined : ($attrs.label as string) ?? $t('Choose language')"
    map-options emit-value stack-label :use-input="($attrs['use-input'] as boolean)??false" input-debounce="0"
    :options="filteredLangs" @update:model-value="onLanguageChange" @filter="filter">
    <!-- x{{$attrs }}x -->
    <template v-if="$attrs.icon!==null" v-slot:before>
      <q-icon :name="($attrs.icon as string) ?? 'svguse:#pl-language'"></q-icon>
    </template>
    <template v-if="$attrs['use-input']!==false" v-slot:append>
      <q-icon name="svguse:#pl-search" size="xs"></q-icon>
    </template>

    <template v-slot:selected-item="scope">
      <q-chip dense @remove="scope.removeAtIndex(scope.index)" :tabindex="scope.tabindex"
        :size="$attrs.size as string || ''" class="q-ma-none q-mr-xs q-my-xs p-pa-none" style="background: transparent"
        :removable="multiple && Array.isArray(modelValue)" v-bind="chip">
        <FlagIcon :code="scope.opt?.value || scope.opt" :shadowed="false" bordered square class="q-mr-sm" />
        <span>{{scope.opt?.label ?? $t(`localeNames.${scope.opt}`)}}</span>
      </q-chip>
    </template>

    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps" :key="scope.opt.value" dense :class="{
        'bg-primary': statusComponent!=='toggle' && scope.selected,
        'text-white': statusComponent!=='toggle' && scope.selected,
      }">
        <q-item-section side>
          <FlagIcon :code="scope.opt.value" :shadowed="false" bordered square width="28px" height="21px" />
        </q-item-section>
        <q-item-section class="q-pr-lg">
          <q-item-label>{{ scope.opt.label }} ({{ scope.opt.value }})</q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-toggle v-if="statusComponent==='toggle'" :model-value="scope.selected" size="xs"
            @update:model-value="scope.toggleOption(scope.opt)" />
          <q-icon v-else-if="scope.selected" color="white" name="svguse:#pl-check"></q-icon>
        </q-item-section>
      </q-item>
    </template>

    <!-- Inherite slots -->
    <template v-for="(_, name) in $slots" :key="name" v-slot:[`${name}`]="slotData">
      <slot :name="name" :key="name" v-bind="slotData" />
    </template>

  </q-select>
</template>

<script lang="ts"> export default { name: 'LanguageSelector', inheritAttrs: false} </script>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n'
import FlagIcon from './FlagIcon.vue'
import { QChipProps } from 'quasar';

const {t: $t} = useI18n()
interface Props {
  modelValue: string | string[];
  multiple: boolean;
  statusComponent: 'check' | 'toggle' | null;
  languages: Record<string, any> | string[];
  exlcudes: string[]
  chip?: QChipProps
}
const emit = defineEmits(['update:modelValue'])
const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  multiple: true,
  statusComponent: 'check',
  languages: () => ({}),
  chip: () => ({}),
  exlcudes: () => ([])
})

const keyword = ref('')
const languageList = computed((): {label:string, value: string, code: string}[] => {
  return Array.isArray(props.languages)
    ? props.languages.map(value=>({
        label: $t(`localeNames.${value}`),
        code: value,
        value,
      }))
    : Object.keys(props.languages).map(lang => ({
        label: (props.languages as Record<string, string>)[lang],
        code: lang,
        value: lang
      }))
})
const filteredLangs = computed(()=>{
  return !keyword.value
    ? languageList.value
    : languageList.value.filter(l=> {
      return l.label.indexOf(keyword.value)!==-1 || l.code.indexOf(keyword.value)!==-1
    })
})

function filter (val: string, update: (cb: any)=>void) {
  update(() => {
    keyword.value = !val ? '' : val
  })
}

async function onLanguageChange (language: string) {
  emit('update:modelValue', language)
}
</script>

<style lang="scss">
.language-selector {
  .q-chip {
    margin-top: 1px;
    margin-bottom: 1px;
    padding-left: 0;
  }
}
</style>
