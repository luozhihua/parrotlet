<template>
  <div class="country-flag" :class="cssClasses" :style="styles">
    <q-img :src="flag" lazy :ratio="rounded ? 1 : 4/3" :spinnerSize="spinnerSize">
      <slot></slot>
      <template #error>
        <span class="q-img-fallback"></span>
      </template>
    </q-img>
  </div>
</template>

<script lang="ts" setup>
import {computed, reactive} from 'vue'

// eslint-disable-next-line no-undef
const props = defineProps({
  rounded: { type: Boolean, default: true, },
  shadowed: { type: Boolean, default: true, },
  bordered: { type: Boolean, default: true, },
  square: { type: Boolean, default: false, },
  code: { type: String, required: true, },
})

const langToContryMapping = reactive({
  en: 'gb',
  zh: 'cn',
  tw: 'cn',
  ja: 'jp',
  ko: 'kr', // 韩语
  sq:'al', //
  uk: 'ua', // 乌克兰
  syr: 'sy', // 叙利亚
  kk: 'kz', // 哈萨克斯坦
  el: 'gr', // 希腊
  da: 'dk', // 丹麦
  div: 'mv', // 马尔代夫
  cs: 'cz', // 捷克
  hy: 'am', // 亚美尼亚
  ka: 'ge', // 格鲁吉亚
  fa: 'ir', // 伊朗-波斯语
  he: 'il', // 以色列-希伯来语
  kor: 'kp', // 朝鲜
})

const flag = computed((): string => {
  const code: string = props.code;
  const contryCode = (code.split(/[_-]/).pop() || '').toLowerCase();
  type K = keyof typeof langToContryMapping
  const langCode = langToContryMapping[contryCode as K]
    || langToContryMapping[code.toLowerCase() as K]
    || contryCode.toLowerCase() || '';
  const img = `/flags/${langCode}.svg`;
  console.log(code, contryCode, langCode);
  return img;
})

const cssClasses = computed(() => {
  return {
    shadowed: props.shadowed,
    bordered: props.bordered,
    rounded: !props.square && props.rounded,
    square: props.square,
  }
})

const styles = computed(() => {
  return {
    width: '1.33em',
    height: '1em',
  }
})

const spinnerSize = computed(()=>{
  return '0.8em'
})
</script>

<style lang="scss">
.country-flag {
  overflow: hidden;
  display: inline-block;
  border-radius: 10%;

  &.bordered {
    border: 1px solid rgba(123, 123, 123, 0.3);
  }

  &.shadowed {
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.2), 2px 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:square {
    border-radius: 0px;
  }

  &.rounded {
    border-radius: 100000px;
  }

  .q-img {
    position: relative;
    height: 100%;
    vertical-align: top;
  }

  .q-img-fallback {
    width: 100%;
    height: 100%;
    background-image: url('../../public/flags/placeholder.svg');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2
  }
}
</style>
