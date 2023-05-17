<template>
  <div class="proxy-settings justify-center">

    <h6 class="settings-label text-subtitle2  q-pt-md q-ma-sm text-grey-7">
      <!-- <q-icon name="public" class="q-mr-sm" />  -->
      {{ $t('Network') }}
    </h6>
    <q-card class="settings-section">
      <q-card-section class="no-padding">
        <q-list separator class="no-padding">
          <q-item tag="label">
            <q-item-section side>
              <q-icon name="svguse:#pl-secret"></q-icon>
            </q-item-section>
            <q-item-section side>
              <q-item-label>
                {{ $t('Enable Proxy') }}
              </q-item-label>
            </q-item-section>
            <q-item-section></q-item-section>
            <q-item-section side>
              <q-toggle name="proxy_enable" v-model="tmpProxy!.enable" val="auto" />
            </q-item-section>
          </q-item>
        </q-list>

        <q-separator></q-separator>

        <q-form :class="`q-pa-md q-gutter-md ${tmpProxy.enable ? '' : 'disabled'}`">
          <q-option-group name="accepted_genres" v-model="tmpProxy.type" color="primary" inline :options="[
            {label: 'http', value: 'http'},
            {label: 'https', value: 'https'},
            {label: 'socks', value: 'socks'},
            {label: 'pac', value: 'pac'},
          ]" />

          <q-input :label="$t('Your proxy server')" :model-value="tmpProxy[tmpProxy.type||'http']"
            @update:modelValue="proxyHostChange" dense clearable>
            <template #prepend>
              <q-select v-model="tmpProxy.type" emit-value map-options readonly disabled borderless dense
                hide-dropdown-icon :options="[
                  {label: 'http://', value:'http'},
                  {label: 'https://', value:'https'},
                  {label: 'socks://', value:'socks'},
                  {label: 'https://', value:'pac'},
                ]" />
            </template>
          </q-input>

          <q-select :label="$t('Proxy white list')" v-model="tmpProxy.bypass" use-input use-chips multiple map-options
            emit-value counter hide-dropdown-icon input-debounce="0" new-value-mode="add-unique"
            :hint="$t('Support {format}.', {format:'Glob: *.foo.com, *bar.com, baz.com'})">

            <template v-slot:append>
              <q-icon name="pl-robot" class="cursor-pointer">
                <q-popup-proxy cover :breakpoint="600">
                  <q-list separator>
                    <q-item v-for="provider in bypassOptions" :key="provider.key" tag="label" clickable v-ripple dense>
                      <q-item-section side>
                        <q-icon :name="provider.icon" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t(provider.label) }}</q-item-label>
                        <div class="text-caption text-weight-thin text-grey-5">{{
                          Object.values(PROVIDER_CONFIG).find(a=>a.proxyBypass===provider.value)?.proxyBypass }}
                        </div>
                      </q-item-section>
                      <q-item-section side>
                        <q-toggle :model-value="provider.selected" @update:model-value="provider.toggle()" />
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-popup-proxy>
              </q-icon>
            </template>

            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" dense>
                <q-item-section side>
                  <q-icon :name="scope.opt.icon" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle :model-value="scope.selected" @update:model-value="scope.toggleOption(scope.opt)" />
                </q-item-section>
              </q-item>
            </template>

            <template v-slot:selected-item="scope">
              <q-chip dense @remove="scope.removeAtIndex(scope.index)" :tabindex="scope.tabindex" size="md"
                class="q-ma-none q-mr-xs" v-bind="!Object.values(PROVIDER_CONFIG).some(a=>a.proxyBypass===scope.opt) ? {
                removable: true, color: 'positive'
              } : {}">
                <q-icon v-if="Object.values(PROVIDER_CONFIG).some(a=>a.proxyBypass===scope.opt)"
                  :name="`svguse:#pl-${Object.values(PROVIDER_CONFIG).find(a=>a.proxyBypass===scope.opt)?.key}`" />
                <span v-else> {{scope.opt}}</span>
              </q-chip>
            </template>
          </q-select>
        </q-form>
      </q-card-section>
    </q-card>

  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, watch, onBeforeUnmount, computed} from 'vue'
// import {useQuasar} from 'quasar'
// import {electron} from '../../util/electron'
import { useSettingStore, Proxy } from '../../stores/useSettingStore';
import { PROVIDER_CONFIG } from '../../../src-electron/translator/constants'
import {useI18n} from 'vue-i18n'
import { upperFirst } from 'lodash-es';

const {t: $t} = useI18n()
const store = useSettingStore()
// const $q = useQuasar()

const tmpProxy = ref<Proxy>({ enable: false, type: 'http',   });
const proxyChanged = ref(false);
const bypassOptions = computed(()=>
  Object.keys(PROVIDER_CONFIG).map(
    (provider)=>{
      const val = PROVIDER_CONFIG[provider as (keyof typeof PROVIDER_CONFIG)]?.proxyBypass
      return {
        key: provider,
        label: $t(upperFirst(provider)),
        icon: `svguse:#pl-${provider}`,
        value: val,
        selected: val ? tmpProxy.value.bypass?.includes(val) : false,
        toggle: ()=>{
          const selected = val ? tmpProxy.value.bypass?.includes(val) : false
          tmpProxy.value.bypass = tmpProxy.value.bypass || []

          if (selected) {
            tmpProxy.value.bypass =  tmpProxy.value.bypass.filter((a)=>a!==val)
          } else {
            val && tmpProxy.value.bypass.push(val)
          }
        }
      }
    }
  )
)

function proxyHostChange(value?: string|number|null) {
  tmpProxy.value[tmpProxy.value.type||'http'] = (value as string) || ''
}

onMounted(()=>{
  tmpProxy.value = JSON.parse(JSON.stringify(store.$state.proxy));

  watch(
    ()=>tmpProxy.value,
    (proxy, old) => {
      if (proxy) {
        proxy.bypass?.sort(
          (a, b) => {
            const A = Object.values(PROVIDER_CONFIG).findIndex(v=>v.proxyBypass===a)
            const B = Object.values(PROVIDER_CONFIG).findIndex(v=>v.proxyBypass===b)
            return (A!==-1) ? (B!==-1 ? A-B : B-A) : 0
          }
        )
        Object.assign(store.$state.proxy, proxy)
      }
    },
    { deep: true }
  );
})

onBeforeUnmount( ()=> {
  proxyChanged.value = false;
})
</script>

<style lang="stylus">
.component-settings
  margin auto

  .section-separator
    display block
    height 0px;
    background-color rgba(123,123,123,0)
</style>
