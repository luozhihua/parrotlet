<template>
  <q-linear-progress v-if="!circle" :value="process ? process.value : 0" :color="color"
    :size="$attrs.size as string || '12px'" v-bind="$attrs" v-on="$emit">
    <div class="absolute-full text-white flex flex-center" style="font-size: 9px;">{{`${ process ? process.percent : 0
      }%`}}</div>
  </q-linear-progress>

  <q-circular-progress v-else show-value
    :font-size="$attrs['font-size'] as string || (parseInt($attrs.size as string || '32') * 0.2 + 'px')"
    :value="process ? process.percent : 0" :size="$attrs.size as string || '32px'"
    :thickness="$attrs.thickness as number || 0.1" :color="color" class="flex items-center content-center justify-center"
    v-bind="$attrs">
    <span v-if="$slots.default" :style="{ padding: `${($attrs.thickness as number || 0.1) * 100}%`}">
      <slot />
    </span>
    <span v-else>{{ process.percent }}%</span>
  </q-circular-progress>
</template>

<script lang="ts">
export default {name: 'TranslateProcess', inheritAttrs: false}
</script>
<script lang="ts" setup>
import {ref, computed, onMounted} from 'vue';
// import { mapGetters, mapActions } from 'vuex';
import {TranslateProcess, countTranslateProcess} from '../util/project';

// eslint-disable-next-line no-undef
const props = defineProps({
  project: { type: Object, required: true, },
  language: { type: String, required: true, },
  circle: { type: Boolean, required: false, },
})
const process = ref<Partial<TranslateProcess>>({value: 0, percent: 0})
const color = computed(() => {
  if (!process.value.value || process.value.value < 0.5) {
    return 'negative'
  } else if (process.value.value >= 0.5 && process.value.value < 0.9) {
    return 'warning'
  } else {
    return 'positive'
  }
})

async function loadProcesses() {
  process.value = await countTranslateProcess(props.project as any, props.language);
}

onMounted(()=>{
  loadProcesses()
})
</script>


<style lang="stylus">
.component-translate-process
  font-family unset;
</style>
