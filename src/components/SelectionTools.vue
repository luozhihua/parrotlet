<template>
  <div v-if="selected?.length" class="q-mr-xm">
    <q-btn dense flat round size="sm" icon="svguse:#pl-robot" @click="translate">
      <q-tooltip>{{ $t('Translate selected text for all languages(only empties)') }}</q-tooltip>
    </q-btn>
    <q-btn dense flat round size="sm" icon="svguse:#pl-delete" @click="remove">
      <q-tooltip>{{ $t('Delete selected text from all languages') }}</q-tooltip>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import { useProjectStore } from '../stores/useProjectStore';
import { useLocaleStore } from '../stores/useLocaleStore';
import pLimit from 'p-limit';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

const limit = pLimit(4)
const $proj = useProjectStore()
const $locale = useLocaleStore()
const $q = useQuasar()
const { t: $t } = useI18n()
const props = defineProps({
  selected: {type: Array as PropType<Record<string, string>[]>, default:()=>[]}
})
const emit = defineEmits(['history'])

async function translate() {
  const mainLang = $proj.project.language
  const languages = $proj.project?.enabledLanguages || []
  const texts = props.selected.map((row)=>row[mainLang])

  await Promise.all(
    languages.map((lang) => {
      return limit(()=>{
        $locale.translate(texts, lang)
      })
    })
  )
  emit('history')
}

async function remove() {
  $q.dialog({
    title: $t('Confirm'),
    message: $t('Are you sure you want to remove selected texts from all languages?')
  }).onOk(()=>{
    props.selected.forEach(
      (row: any)=> $locale.removeText(row._key)
    )
    emit('history')
  })
}
</script>
