<template>
  <q-layout view="hHh lpR fFf" class="no-scroll">
    <q-header>
      <q-chip outline size="xs" class="absolute-top-left no-drag" style="top: 0px; left: 70px;
    box-sizing: content-box;
    padding: 0 8px;">
        <q-avatar>
          <svg class="logo-svg" version="1.1" xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 240 240" xml:space="preserve">
            <g>
              <path id="mouth-1" class="st0" d="M210.1,172.4c0,0,5,22.9,16.4,3c0,0,29.9-53.3-3-104.1c0,0-7-6-12.5,2c0,0-8,13.5-29.4,17.4
                s-24.9,14.9-24.9,14.9s-1,4,5,4.5C167.8,110.6,198.7,120.1,210.1,172.4z" />
              <path id="mouth-1-light" class="st1" d="M222,78.9c0,0-6.5-5.6-11.6,1.9c0,0-2.3,3.9-7.9,8c14.1,19.9,22.4,44.2,22.4,70.3
                c0,6.3-0.5,12.5-1.4,18.5c0.4-0.6,0.8-1.3,1.3-2.1C224.8,175.6,252.5,126.1,222,78.9z" />
              <path id="mouth-2" class="st2" d="M197.9,165.4c0,0-7.2-31.9-38.1-48.8c0,0-13.5-3.5-12,6c0,0-9.6,29.4,8.9,51.8
                C156.7,174.4,194.6,170.9,197.9,165.4z" />

              <ellipse id="nostril" transform="matrix(0.5545 -0.8322 0.8322 0.5545 29.7423 190.5129)" class="st0"
                cx="192.8" cy="67.5" rx="10.7" ry="5.1" />
              <path id="head" class="st3" d="M5.4,150.5c2,6.5,8,30.9,0,40.9c0,0-5.5,8,3.5,5s14.4-7.5,14.4-7.5s41.7,70.2,133.5,44.8
                c0,0-41.8-35.9-8.9-56.3c0,0-31.9-55.3,4.5-83.2c0,0,17.7-13.3,19.3-25.1s12.6-21.3,22.6-20.3c0,0,18.9-3.5,0-21.4
                S83.1-31.9,18.8,56.8c0,0-19.4,30.4-17.4,73.2C1.4,130,3.4,144,5.4,150.5z" />
              <path id="head-light" class="st4" d="M93.7,16.1c0,0,36.6-13.6,77.7,12.3c0,0,8.7,9.9-0.9,10c-9.7,0.1-37.9-19.4-59.7-12
                S93.7,16.1,93.7,16.1z" />
              <circle id="eye" class="st4" cx="79.8" cy="77.5" r="23.5" />
              <path id="pupil" d="M65,78.4c5.1,0,9.3-4.2,9.3-9.3c0-3.9-2.4-7.2-5.8-8.6c2.6-1.8,5.7-2.9,9.1-2.9c8.6,0,15.5,7,15.5,15.5
                s-7,15.5-15.5,15.5c-6.8,0-12.6-4.4-14.7-10.5C63.6,78.3,64.3,78.4,65,78.4z" />
              <path id="light" class="st5"
                d="M34.8,147.7c-0.1-6.3,4.3-14,9-6.7s9.3,2.3,9.3,2.3s5.3-24.3,9.3-1.6s5.2,1.7,5.2,1.7
                s2.4-10.7,11.1-3c8.7,7.7,12-0.7,12-0.7s7-8.7,10.3,6.7c3.3,15.3-13,62,23.7,81C124.8,227.3,35.6,217.4,34.8,147.7z" />
            </g>
          </svg>
        </q-avatar>
        <span class="app-name" style="font-size: 10px;">parrot<span class="app-name-2">let</span></span>
      </q-chip>
      <q-toolbar class="non-selectable q-pt-none q-px-md no-drag">
        <portal-target name="toolbar-left" class="toolbar-left flex text-left justify-start">
          <q-btn @click="router.back()" icon="chevron_left" round dense flat></q-btn>
        </portal-target>
        <q-space />
        <portal-target name="toolbar-center" class="toolbar-center flex text-center self-center align-center"
          style="flex: 1;">
        </portal-target>
        <q-space />
        <portal-target name="toolbar-right" class="toolbar-right flex text-right self-right"></portal-target>
        <q-separator vertical spaced inset></q-separator>
        <StatusDark class="q-mr-sm" />
        <q-btn-group rounded unelevated dense>
          <q-btn flat round unelevated :shadowed="false" dense size="md" icon="settings"
            @click="settingsPanelVisible = !settingsPanelVisible" :color="settingsPanelVisible ? 'primary' : ''" />
          <!-- <q-btn flat round dense size="md" icon="settings" @click="router.push({name: 'settings'})"
            :color="settingsPanelVisible ? 'primary' : ''" /> -->
        </q-btn-group>
      </q-toolbar>
    </q-header>

    <q-page-container class="scroll-y">
      <router-view />
    </q-page-container>

    <q-drawer v-model="settingsPanelVisible" overlay side="right" :mini-to-overlay="true" :width="640" :mini="sidebarMini"
      behavior="desktop" class=" q-pa-md p-bg1 drawer-settings">
      <AllSettings class="q-pa-md" v-if="settingsPanelVisible" />
    </q-drawer>

    <q-footer dense class="text-right">
      <q-toolbar dense class="row flex">
        <div>
          &copy; Parrot Translator. Create by Colin Luo.
        </div>
        <q-space></q-space>
        <div class="text-right">
          <StatusProxy />
          <StatusEngine />
        </div>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script lang="ts" setup>
// import { openURL } from 'quasar';
import {ref, watch} from 'vue'
import {useRouter} from 'vue-router'
import AllSettings from '../components/settings/AllSettings.vue'
import StatusProxy from './status/StatusProxy.vue'
import StatusEngine from './status/StatusEngine.vue'
import StatusDark from './status/StatusDark.vue'

const router = useRouter()
const sidebarMini = ref(false)
const settingsPanelVisible = ref(false)

function onClickOutside(event: MouseEvent) {
  const parents = event.composedPath()
  const inside = parents.some((ele)=>{
    const inDrawer = (ele as Element)?.classList?.contains('drawer-settings')
    const inPopups = (ele as Element)?.classList?.contains('q-menu')
    return inDrawer || inPopups
  })

  if (!inside) {
    settingsPanelVisible.value = false
  }
}

watch(
  ()=>settingsPanelVisible.value,
  (visible)=>{
    if (visible) {
      setTimeout(()=>{
        document?.addEventListener('click', onClickOutside)
      }, 200)
    } else {
      document?.removeEventListener('click', onClickOutside)
    }
  }
)

</script>

<style lang="scss">
.logo-svg {
  width: 100%;
  height: 100%;

  .st0 {
    fill: #ff9903;
  }

  .st1 {
    opacity: 0.4;
    fill: #fff;
  }

  .st2 {
    fill: #ff440d;
  }

  .st3 {
    fill: #00b176;
  }

  .st4 {
    opacity: 0.4;
    fill: #fff;
  }

  .st5 {
    opacity: 0.2;
    fill: #fff;
  }

  .st6 {
    opacity: 0.5;
    fill: #fff;
  }
}

.app-name {
  font-size: 32px;
  line-height: 1;
  font-family: 'Shrikhand', cursive;

  &>* {
    font-family: 'Courgette', cursive;
  }
}

.q-header {
  -webkit-app-region: drag;
  cursor: move;
  padding-top: 20px;

  >* {
    -webkit-app-region: no-drag;
    cursor: default;
  }

  .q-toolbar {
    min-height: 40px;
    margin: 0;
  }

  .no-drag {
    -webkit-app-region: no-drag;
    cursor: default;
  }
}

.q-page-container {
  padding-bottom: 0;
  padding-top: 0;
  // margin-top: $header-height;
  // margin-bottom: $footer-height;
  height: calc(100vh - $header-height - $footer-height);

  >.q-page {
    height: calc(100vh - var(--p-header-height) - var(--p-header-bar-height) - var(--p-footer-height));
    overflow-y: auto
  }
}

.drawer-settings {
  box-shadow: -7px -1px 6px -7px rgba(var(--p-fg1-rgb), 0.5);
}

.q-footer {
  color: #7b7b7b;
  background: $bg2;
  background: var(--p-bg2);

  .q-toolbar {
    padding: 4px 1em;
    text-align: right;
    min-height: unset;
  }
}

.darkness-mode {
  .q-footer {
    color: #fff;
  }
}
</style>
