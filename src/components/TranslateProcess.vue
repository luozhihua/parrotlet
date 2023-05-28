<template>
  <q-linear-progress v-if="!circle" :value="progress" :color="color" :size="$attrs.size as string || '12px'"
    v-bind="$attrs" v-on="$emit">
    <div class="absolute-full text-white flex flex-center" style="font-size: 9px;">
      {{`${ percent }%`}}
    </div>
  </q-linear-progress>

  <q-circular-progress v-else show-value
    :font-size="$attrs['font-size'] as string || (parseInt($attrs.size as string || '32') * 0.2 + 'px')" :value="percent"
    :size="$attrs.size as string || '32px'" :thickness="$attrs.thickness as number || 0.1" :color="color"
    class="flex items-center content-center justify-center" v-bind="$attrs">
    <span v-if="$slots.default" :style="{ padding: `${($attrs.thickness as number || 0.1) * 100}%`}">
      <slot />
    </span>
    <span v-else>{{ percent }}%</span>
  </q-circular-progress>
</template>

<script lang="ts">
export default {name: 'TranslateProcess', inheritAttrs: false}
</script>
<script lang="ts" setup>
import {ref, computed, onMounted, watch} from 'vue';

// eslint-disable-next-line no-undef
const props = defineProps({
  progress: {type:Number, default: 0},
  circle: { type: Boolean, required: false, },
})
const progress = ref(props.progress)
const percent = computed(()=>Math.ceil(progress.value*100))
const color = computed(() => {
  if (!progress.value || progress.value < 0.5) {
    return 'negative'
  } else if (progress.value >= 0.5 && progress.value < 0.9) {
    return 'warning'
  } else {
    return 'positive'
  }
})

onMounted(()=>{
  watch(
    ()=> props.progress,
    (val) =>{
      progress.value = val
    }
  )

})
</script>


<style lang="stylus">
.component-translate-process
  font-family unset;
</style>
