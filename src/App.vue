<template>
  <router-view />
</template>

<script setup lang="ts">
import {useQuasar} from'quasar'

const $q = useQuasar()
$q.iconSet.field.clear = 'svguse:#pl-clear'
// $q.iconSet.arrow.dropdown = 'svguse:#pl-arrow-down'
// $q.iconSet.arrow.up = 'svguse:#pl-arrow-up'
$q.iconMapFn = (iconName: string) => {
  if (iconName.startsWith('pl-') === true) {
    // we strip the "app:" part
    const name = iconName.substring(3)

    return {
      cls: 'parrotlet pl-' + name
    }
  }
}
</script>
