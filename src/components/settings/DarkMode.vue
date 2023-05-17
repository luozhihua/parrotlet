<template>
  <h6 class="settings-label text-subtitle2  q-pt-md q-ma-sm text-grey-7">
    {{ $t('Dark mode') }}
  </h6>
  <q-card class="settings-section">
    <q-card-section class="no-padding">
      <q-list separator class="no-padding">
        <q-item tag="label">
          <q-item-section avatar>
            <q-icon name="svguse:#pl-dark-auto"></q-icon>
          </q-item-section>
          <q-item-section>
            <q-item-label>
              Follow system
              <span class="system-darkness-mode text-primary">(Dark)</span>
              <span class="system-brightness-mode text-primary">(Brightness)</span>
            </q-item-label>
            <q-item-label caption lines="1">Only supported macOS Mojave and Catalina</q-item-label>
          </q-item-section>
          <q-item-section side top>
            <q-radio :model-value="store.darkMode" @update:model-value="onModeChanged" val="auto" />
          </q-item-section>
        </q-item>
        <q-item tag="label">
          <q-item-section avatar>
            <q-icon name="svguse:#pl-dark"></q-icon>
          </q-item-section>
          <q-item-section>Darkness</q-item-section>
          <q-item-section side top>
            <q-radio :model-value="store.darkMode" @update:model-value="onModeChanged" val="dark" />
          </q-item-section>
        </q-item>
        <q-item tag="label">
          <q-item-section avatar>
            <q-icon name="svguse:#pl-light"></q-icon>
          </q-item-section>
          <q-item-section>Brightness</q-item-section>
          <q-item-section side top>
            <q-radio :model-value="store.darkMode" @update:model-value="onModeChanged" val="light" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script lang="ts" setup>
import { DarkMode, useSettingStore } from '../../stores/useSettingStore';
const store = useSettingStore()
function onModeChanged (mode: DarkMode) {
  store.updateMode(mode)
}
</script>
