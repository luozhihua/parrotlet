<template>
  <div class="row-tools">
    <q-btn dense flat round size="sm" icon="svguse:#pl-robot" @click="translateEmpties()">
      <q-tooltip>{{ $t('Translate all of language for this row') }}</q-tooltip>
    </q-btn>
    <q-btn dense flat round size="sm" icon="svguse:#pl-delete" @click="del()">
      <q-tooltip>{{ $t('Delete this row') }}</q-tooltip>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { nextTick, watch } from 'vue'
import { useLocaleStore } from '../stores/useLocaleStore'
import { useProjectStore } from '../stores/useProjectStore'
import pLimit from 'p-limit'
import { PROVIDERS } from '../../src-electron/translator/constants'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'

interface Props {
  projectId: string
  textKey: string
  row: Record<string, string> | null
}
const props = withDefaults(defineProps<Props>(), {
  row: null
})
const emit = defineEmits(['history'])
const store = useProjectStore()
const { loadProjectLocale, translate, removeText } = useLocaleStore()
const limit = pLimit(6)
const $q = useQuasar()
const { t: $t} = useI18n()

async function translateEmpties(provider?: PROVIDERS) {
  await Promise.all(
    store.project?.enabledLanguages.map((lang)=>limit(
      async ()=> {
        await translate(props.textKey, lang)
      }
    ))
  )
  nextTick(()=>{
    emit('history')
  })
}

function del() {
  $q.dialog({
    title: $t('Confirm'),
    message: $t('Would you like to remove texts of this row?'),
    cancel: true,
    persistent: true
  }).onOk(() => {
    doDelete()
  })
}
async function doDelete(){
  await removeText(props.textKey, props.projectId)
  nextTick(()=>{
    emit('history')
  })
}

watch(()=>props.projectId, (id)=>{
  store.activeId = id
  loadProjectLocale(id)
}, {immediate: true})

</script>

<style lang="scss">
.row-tools {
  display: none;
  height: 20px;
}

tr:hover {
  .row-tools {
    display: block;
  }
}
</style>
