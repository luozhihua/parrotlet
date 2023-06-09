<template>
  <q-popup-proxy v-if="row && col" :model-value="visible" :target="`.cell-${row._id}-${col._id}`" ref="$cellEditor"
    persistent no-parent-event @hide="onHide" :offset="[8,1]" class="p-bg cell-editor">
    <div class="q-px-md q-pt-md p-bg1 info" style="min-width: 320px; max-width: 540px;">
      <q-field :label="$t(`localeNames.${baseLang}`) + ' - (' + $t('primary-language') + ')'" stack-label readonly
        borderless>
        <template v-slot:prepend>
          <FlagIcon :code="baseLang" square width="24px" height="24px" />
        </template>
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">
            {{baseText}}
            <q-btn flat round dense size="sm" color="primary" icon="svguse:#pl-speak"
              @click="speak(baseText, baseLang)" />
          </div>
        </template>
      </q-field>
    </div>
    <q-separator></q-separator>
    <div class="q-pa-xs xp-bg1 xinput" style="min-width: 400px">
      <q-toolbar style="min-height: unset;">
        <q-btn flat round dense size="md" icon="svguse:#pl-undo" :disable="!canUndo" @click="undo()">
          <q-tooltip anchor="top middle" self="bottom middle">{{$t('Undo')}}</q-tooltip>
        </q-btn>
        <q-btn flat round dense size="md" icon="svguse:#pl-redo" :disable="!canRedo" @click="redo()">
          <q-tooltip anchor="top middle" self="bottom middle">{{$t('Redo')}}</q-tooltip>
        </q-btn>

        <q-separator spaced vertical></q-separator>

        <template v-for="provider in providers" :key="provider.key">
          <q-btn dense v-if="provider.enable" flat round size="sm" :icon="`svguse:#pl-${provider.key}`"
            :loading="!!translateToInputLoading" @click="translateToInput(baseText, col._key, provider.key)">
            <q-tooltip anchor="top middle" self="bottom middle">
              {{ upperFirst($t(provider.key)) }}
            </q-tooltip>
          </q-btn>
        </template>
        <q-space />
        <q-btn flat round dense size="sm" color="primary" icon="svguse:#pl-speak"
          @click="translation && speak(translation, col._key)" />
      </q-toolbar>
      <q-input :type="rows > 1 ? 'textarea' : 'text'" :label="$t(`localeNames.${col._key}`)" :rows="rows"
        :model-value="translation" label-color="primary" clearable stack-label autofocus outlined bottom-slots
        @update:model-value="(v)=>{translation = (v as string); commit();}" @keyup.ctrl.enter="done();"
        @keyup.meta.enter="done();">
        <template v-slot:prepend>
          <!-- <q-icon name="svguse:#pl-edit" color="primary"></q-icon> -->
          <FlagIcon :code="col._key" square width="24px" height="24px" />
        </template>
      </q-input>
    </div>

    <div class="flex q-pa-md justify-end p-bg2 sticky-bottom">
      <q-btn color="primary" @click="done();" icon="svguse:#pl-check">
        <span class="q-mr-sm">{{$t('confirm')}}</span>
        <span class="text-lowercase text-weight-light text-grey-5 text-caption">(Ctrl + Enter)</span>
      </q-btn>
      <q-space></q-space>
      <q-btn :label="$t('cancel')" flat v-close-popup @click="$cellEditor?.hide()" />
    </div>
  </q-popup-proxy>
</template>

<script setup lang="ts">
import { nextTick, ref, watch, computed } from 'vue';
import useHistory from '../compasibles/useHistory'
import useProvider from '../compasibles/useProvider';
import useSpeak from '../compasibles/useSpeak';
import FlagIcon from '../components/FlagIcon.vue';
import { PROVIDERS } from '../../src-electron/translator/constants';
import { electron } from '../util/electron';
import { QMenu, QPopupProxy } from 'quasar';
import { upperFirst } from 'lodash-es'

export interface Props {
  row: Record<string, string>
  col: Record<string, string>
  baseLang: string
  baseText: string
  modelValue: string
  visible: boolean
}
const props = withDefaults(defineProps<Props>(), {
  row: ()=>({}),
  col: ()=>({}),
  modelValue: '',
  baseLang: '',
  visible: false
})
const emit = defineEmits(['update:model-value', 'update:visible'])
defineExpose({ updatePosition })

const $cellEditor = ref<QPopupProxy | null>(null)
const translation = ref(props.modelValue)
const { providers } = useProvider()
const { speak } = useSpeak()
const {clear, commit, undo, redo, canUndo, canRedo} = useHistory(translation, false)

const rows = computed(()=>{
  const len = encodeURIComponent(translation.value).replace(/%../g, 'x').length
  return Math.ceil(len / 40)
})

let translateToInputLoading: PROVIDERS | undefined
async function translateToInput(text: string, target: string, provider?: PROVIDERS) {
  const source = props.baseLang
  translateToInputLoading = provider
  translation.value = await translate(text, target, source, provider)
  translateToInputLoading = undefined
}


async function translate(text: string, target: string, source:string = props.baseLang, provider?: PROVIDERS) {
  return await (
    provider ?
      electron.translateByEngine(provider, text, target, source) :
      electron.translate(text, target, source)
  )
}

function onHide() {
  emit('update:visible', false)
}

function done() {
  emit('update:model-value', translation.value)
  translation.value = ''
  onHide()
}

function updatePosition() {
  const menu = ($cellEditor.value?.currentComponent?.ref as QMenu)
  menu?.updatePosition()
}

watch(
  [()=>props.modelValue, ()=>props.row, ()=>props.col],
  ([val])=>{
    clear()
    translation.value = val
    nextTick(()=>{
      const menu = ($cellEditor.value?.currentComponent?.ref as QMenu)
      menu?.updatePosition()
      setTimeout(()=>{
        menu?.focus()
      },200)
    })
  },
  {deep: true}
)

</script>

<style lang="scss">
</style>
