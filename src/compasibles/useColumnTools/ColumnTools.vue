<template>
  <q-popup-proxy v-bind="$attrs" v-model="visible" :target="`.th-${lang} .col-tools-btn`" anchor="bottom end"
    self="top end" :offset="[8,5]" auto-close>
    <header class="p-bg1 text-center q-pa-md">
      <FlagIcon :code="lang" square width="1em" height="1em" class="q-mr-xs" />
      <span>{{ $t(`localeNames.${lang}`) }}</span>
    </header>
    <div class="q-px-sm q-py-md">

      <q-list separator>
        <!-- Language editor() -->
        <q-item clickable v-ripple @click="gotoLanguageEditor(lang)">
          <q-item-section side>
            <q-icon size="xs" name="svguse:#pl-edit" />
          </q-item-section>
          <q-item-section>
            <div class="no-wrap">
              {{ $t('Open language text editor of {lang}', {lang: $t(`localeNames.${lang}`)}) }}
              <q-icon dense size="16px" name="svguse:#pl-open" />
            </div>
          </q-item-section>
        </q-item>

        <!-- Translate() -->
        <q-item clickable v-ripple @click="translateLocaleFile()">
          <q-item-section side>
            <q-icon size="xs" name="svguse:#pl-robot" />
          </q-item-section>
          <q-item-section>{{ $t('Translate empty fields of {lang}', {lang: $t(`localeNames.${lang}`)}) }}</q-item-section>
        </q-item>

        <!-- Save() -->
        <q-item clickable v-ripple @click="lang && localeStore.save(lang)">
          <q-item-section side>
            <q-icon size="xs" name="svguse:#pl-save" />
          </q-item-section>
          <q-item-section>{{ $t('Save {lang}', {lang: $t(`localeNames.${lang}`)}) }}</q-item-section>
        </q-item>

        <!-- Toggle column -->
        <q-item clickable v-ripple @click="lang && toggleColumn(lang)">
          <q-item-section side>
            <q-icon size="xs" name="svguse:#pl-hide" />
          </q-item-section>
          <q-item-section>{{ $t('Hide column {lang}', {lang: $t(`localeNames.${lang}`)}) }}</q-item-section>
        </q-item>

        <!-- Delete() -->
        <q-item clickable v-ripple @click="removeLang(lang)" class="text-red">
          <q-item-section side>
            <q-icon size="xs" name="svguse:#pl-delete" class="text-red" />
          </q-item-section>
          <q-item-section>{{ $t('Remove {lang}', {lang: $t(`localeNames.${lang}`)}) }}</q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-popup-proxy>
</template>

<script lang="ts">export default {name:'ColumnTools', inheritAttrs: false}</script>
<script setup lang="ts" generic="T extends Record<string, any>">
import { computed, nextTick } from 'vue';
import { useLocaleStore } from '../../stores/useLocaleStore';
import useColumnToggle from '../useColumnToggle';
import FlagIcon from '../../components/FlagIcon.vue'
import { useQuasar } from 'quasar';
import { useProjectStore } from '../../stores/useProjectStore';
import { useI18n } from 'vue-i18n';
import {useRouter, useRoute} from 'vue-router';

interface Props {
  modelValue: boolean,
  lang: string,
}
const { t: $t } = useI18n()
const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const localeStore = useLocaleStore()
const projectStore = useProjectStore()
const emit = defineEmits(['update:model-value', 'update:columns', 'history'])
const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  lang: ''
})
const { toggleColumn } = useColumnToggle()

const visible = computed({
  get(){ return props.modelValue; },
  set(visible: boolean) { emit('update:model-value', visible) }
})

function gotoLanguageEditor(lang: string) {
  route.name && router.push({
    name: 'project-translator-lang',
    params: {
      id: route.params.id,
      lang: lang,
    }
  })
}

async function translateLocaleFile() {
  await localeStore.translateLocaleFile(props.lang)
  nextTick(()=>{
    emit('history')
  })
}

async function removeLang(lang: string) {
  $q.dialog({
    title: $t('Remove {name}', {name: $t(`localeNames.${lang}`)}),
    message: $t('Remove language "{lang}" from project {name}', {
      lang: $t(`localeNames.${lang}`),
      name: projectStore.project.name
    }),
    options: {
      type: 'checkbox',
      model: true as any,
      // inline: true
      items: [
        { label: $t('And delete the language file also'), value: true, color: 'primary', labelColor: 'red' },
      ]
    },
    cancel: true,
    persistent: true
  })
  .onOk(async (removeFile)=>{
    await localeStore.removeLanguage(lang, removeFile)
    emit('history')
  })
}
</script>

<style lang="scss">
.q-table-column-tools {
  position: sticky;
  top: 28px;
  z-index: 5;
  // backdrop-filter: blur(2px);
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
