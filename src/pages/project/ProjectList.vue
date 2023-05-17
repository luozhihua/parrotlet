<template>
  <q-page class="app-page page-project-list q-pa-xl items-center no-scroll">
    <q-card class="absolute-center" style="width: 800px; max-height: calc(100vh - 160px); height: 100vh;">
      <q-card-section>{{ $t('projects') }}</q-card-section>
      <q-separator></q-separator>
      <q-card-section class="no-padding scroll" style="height: calc(100% - 55px);">
        <ProjectList />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import ProjectList from '../../components/ProjectList.vue';
</script>

<style lang="stylus">
.page-project-list {
  }
</style>
