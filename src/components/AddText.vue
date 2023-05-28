<template>
  <DefineTemplate>
    <q-tooltip>{{ $t('Add text') }}</q-tooltip>
    <q-dialog v-model="dialogVisible" persistent>
      <q-card>
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{$t('Add text')}}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="save" @reset="onReset" class="q-gutter-md">
            <q-input dense filled v-model="form.key" :label="'* '+$t('Key of new text')"
              :hint="$t('Enter key of new text')" lazy-rules
              :rules="[ val => val && val.length > 0 || $t('Text key is Required!')]">
              <template #prepend>
                <q-icon name="svguse:#pl-key"></q-icon>
              </template>
            </q-input>

            <q-input dense filled v-model="form.text" :label="'* ' + $t('Text')" lazy-rules :rules="[
                val => val && val.length > 0 || $t('Required'),
              ]">
              <template #prepend>
                <FlagIcon :code="$proj.project?.language" width="1em" square no-sahdow></FlagIcon>
              </template>
            </q-input>

            <q-toggle v-model="form.translate" :label="$t('Translate new text to all languages automaticlly')" />
          </q-form>
        </q-card-section>

        <q-card-actions class="row flex">
          <q-btn :label="$t('Submit')" color="primary" @click="save" />
          <q-btn :label="$t('Reset')" color="primary" flat class="q-ml-sm" @click="onReset" />
          <q-space></q-space>
          <q-btn :label="$t('Cancel')" flat class="q-ml-sm" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </DefineTemplate>
  <q-btn dense rounded size="sm" color="primary" icon="svguse:#pl-plus" :label="$t('Add text')"
    @click="dialogVisible=true" v-bind="$attrs">
    <ReuseTemplate v-if="!$slots.default" />
    <!-- Inherite slots -->
    <template v-for="(_, name) in $slots" :key="name" v-slot:[`${name}`]="slotData">
      <ReuseTemplate v-if="name==='default'" />
      <slot :name="name" :key="name" v-bind="slotData" />
    </template>
  </q-btn>
</template>

<script lang="ts">export default {name: 'AddText', inheritAttrs: false}</script>
<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useLocaleStore } from '../stores/useLocaleStore';
import FlagIcon from '../components/FlagIcon.vue'
import { useProjectStore } from '../stores/useProjectStore';
import { createReusableTemplate } from '@vueuse/core'

const [DefineTemplate, ReuseTemplate] = createReusableTemplate()
const emit = defineEmits(['history'])
const $locale = useLocaleStore()
const $proj = useProjectStore()
const dialogVisible = ref(false)
const form = reactive({
  key: '',
  text: '',
  translate: false,
})

async function save() {
  if(form.key && form.text) {
    await $locale.addText(form.key, form.text, !!form.translate)
    emit('history')
    dialogVisible.value = false
    onReset()
  }
}

function onReset () {
  form.key = ''
  form.text = ''
  form.translate = false
}
</script>
