<template>
  <q-list no-border link inset-delimiter separator class="project-list-component">
    <q-item clickable v-for="proj in projects" :key="proj.name"
      @click="$router.push({name:'project-translator', params: {id: proj.id}})">
      <q-item-section avatar>
        <q-avatar rounded color="white" text-color="grey-5">
          <img v-if="proj.logo" :src="proj.logo" alt="">
          <q-icon v-else name="folder" size="36px" />
        </q-avatar>
      </q-item-section>
      <q-item-section>
        <q-item-label class="text-weight-medium">
          {{ proj.name }}
        </q-item-label>
        <q-item-label class="text-grey-6" caption>
          <span>{{$t('enabled-languages-count', proj.enabledLanguages.length)}}</span>
          <span class="text-weight-light"> - ({{$t('primary-language')}}: {{ $t(`localeNames.${proj.language}`) }})</span>
        </q-item-label>
        <q-item-label class="text-grey-6" caption lines="1">{{ proj.path }}</q-item-label>
      </q-item-section>
      <q-item-section side>
        <div>
          <q-btn flat round size="12px" icon="info" color="primary" @click.stop="gotoEditor(proj)">
            <q-tooltip>{{ $t('modify-project-info') }}</q-tooltip>
          </q-btn>

          <q-btn flat round size="12px" icon="edit" color="primary"
            @click.stop="$router.push({ name: 'project-details', params: {id: proj.id} })">
            <q-tooltip>{{ $t('Languages') }}</q-tooltip>
          </q-btn>

          <q-btn flat round size="12px" icon="delete" color="negative" @click.stop>
            <q-popup-proxy>
              <q-banner>
                {{ $t('confirm-remove-it', [proj.name]) }}
                <q-btn color="negative" @click="store.remove(proj.name)">{{$t('remove')}}</q-btn>
              </q-banner>
            </q-popup-proxy>
            <q-tooltip>{{ $t('remove-project-from-list') }}</q-tooltip>
          </q-btn>
        </div>
      </q-item-section>
    </q-item>

    <q-separator />
    <q-btn @click="gotoCreator" class="full-width q-pa-md btn-add-project square" borderless flat icon="add" size="md"
      color="primary" unelevated>
      {{ $t('add-project') }}
    </q-btn>
  </q-list>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { Project, useProjectStore } from '../stores/useProjectStore';
import {useI18n} from 'vue-i18n'

const router = useRouter()
const store = useProjectStore()
const {t: $t} = useI18n()

// const creatingDialog = ref(false)
// const newProject = ref({})
// const editingProject = ref(null)
// const add = (...args: any[])=>store.dispatch(`${moduleNames.projects}/add`, ...args)
const projects = computed(()=>store.projects)

function gotoCreator () {
  router.push({
    name: 'project-creator',
  });
}

function gotoEditor (project: Project) {
  router.push({
    name: 'project-editor',
    params: { id: project.id },
  });
}

</script>

<style lang="scss">
.project-list-component {
  .btn-add-project {
    position: sticky;
    bottom: 0px;
  }
}
</style>
