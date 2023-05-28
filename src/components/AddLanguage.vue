<template>
  <DefineTemplate>
    <q-tooltip>{{ $t('Add language') }}</q-tooltip>
    <q-dialog v-model="dialogVisible" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <div class="text-h6">{{$t('Add language')}}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pb-lg">
          <q-form @submit.prevent="save" @reset="onReset" class="q-gutter-md">
            <LanguageSelector v-model="form.lang" :exlcudes="$proj.project.enabledLanguages" multiple
              :languages="availableLanguages" filled :label="$t('Select languages')" behavior="dialog" use-input>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    {{$t('No results')}}
                  </q-item-section>
                </q-item>
              </template>
            </LanguageSelector>

            <!-- <q-select f></q-select> -->
            <q-toggle v-model="form.translate" :label="$t('Fill new language text with transition automaticlly')"
              style="margin-left: 10px;" />
          </q-form>
        </q-card-section>

        <q-card-actions class="row flex">
          <q-btn :label="$t('Submit')" color="primary" @click="save" rounded />
          <q-btn :label="$t('Reset')" color="primary" flat class="q-ml-sm" @click="onReset" />
          <q-space></q-space>
          <q-btn :label="$t('Cancel')" flat class="q-ml-sm" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </DefineTemplate>
  <q-btn dense round size="sm" color="primary" icon="svguse:#pl-plus" @click="dialogVisible=true" v-bind="$attrs">
    <ReuseTemplate v-if="!$slots.default" />

    <!-- Inherite slots -->
    <template v-for="(_, name) in $slots" :key="name" v-slot:[`${name}`]="slotData">
      <ReuseTemplate v-if="name==='default'" />
      <slot :name="name" :key="name" v-bind="slotData" />
    </template>
  </q-btn>
</template>

<script lang="ts">export default {name: 'AddLanguage', inheritAttrs: false}</script>
<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useLocaleStore } from '../stores/useLocaleStore';
import LanguageSelector from '../components/LanguageSelector.vue'
import { useProjectStore } from '../stores/useProjectStore';
import * as baseLangTexts from '../i18n/langs/zh-CN.json';
import { useI18n } from 'vue-i18n';
import { createReusableTemplate } from '@vueuse/core'

const [DefineTemplate, ReuseTemplate] = createReusableTemplate()
const {t: $t} = useI18n()
const emit = defineEmits(['history'])
const $locale = useLocaleStore()
const $proj = useProjectStore()
const dialogVisible = ref(false)
const form = reactive({
  lang: [] as string[],
  translate: false,
})
const availableLanguages = computed(()=>{
  return Object.keys((baseLangTexts as any).localeNames).filter((l)=>{
    const exists = $proj?.project?.enabledLanguages?.some((el)=>el===l)
    return !exists
  })
})

async function save() {
  if(form.lang?.length > 0) {
    await $locale.addLanguage(form.lang, form.translate);
    emit('history')
    dialogVisible.value = false
    onReset()
  }
}

function onReset () {
  form.lang = []
  form.translate = false
}
</script>
