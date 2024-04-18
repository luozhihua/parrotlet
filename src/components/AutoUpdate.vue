<template>
  <q-dialog v-model="visible" position="top" class="xxxxxxxxxxx">
    <q-card style="width: 500px">
      <q-card-section class="row items-center no-wrap">
        <q-icon name="svguse:#pl-new" size="lg" class="q-mr-md" color="green"></q-icon>
        <div>
          <div class="text-weight-bold text-green">{{$t('Has new release of ParrotLet')}}</div>
          <div class="text-grey">Your version: v{{pkg.version}}</div>
        </div>

        <q-space />

        <q-btn rounded flat :label="$t('ignore')" />
        <q-btn rounded :label="$t('upgrade')" color="positive" icon="svguse:#pl-update" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import pkg  from '../../package.json'
import {ref} from 'vue'

const visible = ref(true)

// elemc

</script>
