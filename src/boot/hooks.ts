import { BootFileParams } from '@quasar/app-vite';
import { StateTree, SubscriptionCallbackMutation } from 'pinia';
import { boot } from 'quasar/wrappers';
import { ID as settingId, useSettingStore } from '../stores/useSettingStore';
import { electron } from '../util/electron';
import { Dark, Quasar } from 'quasar';
import { importQuasarLang } from 'src/util/quasar-langs';

async function settingHook(
  mutation: SubscriptionCallbackMutation<StateTree>,
  state: StateTree,
  features: BootFileParams<any>
) {
  const { app } = features;
  const { darkMode, proxy } = state;
  const language = state.language?.value || state.language;

  // Update quasar languages
  const mode = darkMode === 'auto' ? darkMode : darkMode === 'dark';
  // const [{ Dark, Quasar }, { importQuasarLang }] = await Promise.all([
  //   import('quasar'),
  //   import('src/util/quasar-langs'),
  // ]);
  Dark.set(mode);
  importQuasarLang(language).then((langPack) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Quasar as any)?.lang?.set(langPack, {});

    // Update i18n current language
    const i18n = app.config.globalProperties.$i18n;
    if (i18n) {
      i18n.locale = language;
    }
  });

  // Set locale with Axios headers
  if (app.config.globalProperties.$axios?.defaults?.headers?.common) {
    app.config.globalProperties.$axios.defaults.headers.common[
      'Accept-Language'
    ] = language;
  }

  // Apply locale onto HTML attributes
  document?.querySelector('html')?.setAttribute('lang', language);

  // Proxy
  // debugger;
  electron.proxyChanged();
}

export default boot((features) => {
  const { store: pinia } = features;
  pinia.use(({ store }) => {
    store.$subscribe(async (mutation, state) => {
      switch (mutation.storeId) {
        case settingId:
          settingHook(mutation, state, features);
          break;
      }
    });
  });

  const settingsStore = useSettingStore(pinia);
  const states = Object.fromEntries(
    Object.keys(settingsStore.$state).map((k) => [
      k,
      (settingsStore.$state as any)[k],
    ])
  );
  // debugger;
  settingsStore.$patch(states);
});
