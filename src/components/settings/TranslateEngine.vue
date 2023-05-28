<template>
  <div class="settings-translate-api justify-center">

    <h6 class="settings-label text-subtitle2  q-pt-md q-ma-sm text-grey-7">
      {{ $t('Translate Engine') }}
    </h6>
    <q-card class="settings-section">
      <q-card-section>
        {{ $t('翻译引擎使用策略') }}
        <q-option-group v-model="store.$state.policy" :options="policies" inline></q-option-group>
      </q-card-section>
      <q-separator></q-separator>
      <q-splitter :model-value="30" style="height: 320px">
        <template v-slot:before>
          <q-tabs v-model="providerTab" class="provider-tabs" indicator-color="primary" inline-label outside-arrows
            mobile-arrows dense vertical>
            <q-tab v-for="provider in PROVIDERS" :key="provider" :name="provider" :icon="`svguse:#pl-${provider}`"
              :label="upperFirst($t(provider))" :no-caps="true">
              <q-space></q-space>
              <q-toggle v-model="store.$state.engines" :val="provider" dense @click="providerTab=provider"
                class="q-ml-lg" />
            </q-tab>
          </q-tabs>
        </template>

        <template v-slot:after>
          <q-tab-panels v-model="providerTab" animated swipeable infinite vertical>
            <q-tab-panel v-for="provider in PROVIDERS" :key="provider" :name="provider">
              <q-form
                :class="`q-px-md q-gutter-md translator-provider-settings-list ${store.$state.engines?.includes(provider) ? '' : 'disabled'}`">
                <TranslateGoogleSettings v-if="provider === 'google'" />
                <TranslateAzureSettings v-if="provider === 'azure'" />
                <TranslateDeeplSettings v-if="provider === 'deepl'" />
                <TranslateAliyunSettings v-if="provider === 'aliyun'" />
                <TranslateBaiduSettings v-if="provider === 'baidu'" />
                <TranslateTencentSettings v-if="provider === 'tencent'" />
                <TranslateHuaweiSettings v-if="provider === 'huawei'" />
              </q-form>
            </q-tab-panel>
          </q-tab-panels>
        </template>
      </q-splitter>
    </q-card>

  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { upperFirst } from 'lodash-es'
import { POLICIES, PROVIDERS } from '../../../src-electron/translator/constants';
import { useTranslateStore } from '../../stores/useTranslateStore';
import TranslateGoogleSettings from './TranslateGoogleSettings.vue';
import TranslateAzureSettings from './TranslateAzureSettings.vue';
import TranslateDeeplSettings from './TranslateDeeplSettings.vue';
import TranslateBaiduSettings from './TranslateBaiduSettings.vue';
import TranslateAliyunSettings from './TranslateAliyunSettings.vue';
import TranslateTencentSettings from './TranslateTencentSettings.vue';
import TranslateHuaweiSettings from './TranslateHuaweiSettings.vue';

const store = useTranslateStore()
const { t: $t} = useI18n()

store.$state.engines = Array.isArray(store.$state.engines) ? store.$state.engines : []

const providerTab = ref('google')
const policies = computed(()=>{
  return Object.values(POLICIES).map(policy => ({
    label: $t(policy),
    value: policy
  }))
})
</script>

<style lang="scss">
.component-settings {
  margin: auto;

  .section-separator {
    display: block;
    height: 0px;
    background-color: rgba(123, 123, 123, 0);
  }
}

.translator-provider-settings-list {
  position: relative;

  &.disabled:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
    // backdrop-filter: blur(5px);
    background-color: rgba(var(--p-bg-rgb), 0.2);
    background-image: url("data:image/svg+xml, %3Csvg viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cpath d='M222.634667 272.298667A382.4 382.4 0 0 0 138.666667 512c0 212.117333 171.904 384 384 384 90.666667 0 174.016-31.424 239.701333-83.968l-539.733333-539.733333z m60.330666-60.330667l539.733334 539.733333A382.4 382.4 0 0 0 906.666667 512c0-212.117333-171.904-384-384-384-90.666667 0-174.016 31.424-239.701334 83.968zM53.333333 512c0-259.221333 210.090667-469.333333 469.333334-469.333333 259.221333 0 469.333333 210.090667 469.333333 469.333333 0 259.221333-210.090667 469.333333-469.333333 469.333333-259.221333 0-469.333333-210.090667-469.333334-469.333333z' fill='%23d81e06' %3E%3C/path%3E%3C/svg%3E");
    background-position: center;
    background-repeat: no-repeat;
  }
}

.provider-tabs {
  .q-tab {
    justify-content: start;

    .q-tab__content {
      width: 100%;
    }

    &.q-tab--active {
      background-color: var(--p-bg)
    }
  }
}
</style>
