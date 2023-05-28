import { boot } from 'quasar/wrappers';
import { I18n, createI18n } from 'vue-i18n';
import messages from 'src/i18n';
import { PiniaPlugin } from 'pinia';
import { App } from 'vue';
import { Dark, Quasar } from 'quasar';
import { importQuasarLang } from 'src/util/quasar-langs';

export type MessageLanguages = keyof typeof messages;
// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = (typeof messages)['en-US'];

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
/* eslint-disable @typescript-eslint/no-empty-interface */
declare module 'vue-i18n' {
  // define the locale messages schema
  export interface DefineLocaleMessage extends MessageSchema {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {}

  // define the number format schema
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-interface */

const systemLang = typeof process !== undefined ? process.env.LANG : null;
const clientLang = navigator?.language;
const defaultLocale = import.meta.env.DEV
  ? 'en-US'
  : (systemLang || clientLang || 'zh').split('.')[0];
const fallbackLocale = (clientLang || 'en')?.split('.')[0];

function languageSettingsSubscriber(
  app: App,
  i18n: I18n<typeof messages, unknown, unknown, string, false>
): PiniaPlugin {
  return ({ store }) => {
    store.$subscribe(async (mutation, state) => {
      // react to store changes
      if (mutation.storeId === 'settings') {
        const { mode, language } = state;

        // Update quasar languages
        const _mode = mode === 'auto' ? mode : mode === 'dark';
        // const [{ Dark, Quasar }, { importQuasarLang }] = await Promise.all([
        //   import('quasar'),
        //   await import('src/util/quasar-langs'),
        // ]);
        Dark.set(_mode);
        importQuasarLang(language).then((langPack) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (Quasar as any)?.lang?.set(langPack, {});
        });

        // Update i18n current language
        if (i18n.mode === 'legacy') {
          i18n.global.locale = language;
        } else {
          i18n.global.locale.value = language;
        }

        // Set locale with Axios headers
        if (app.config.globalProperties.$axios?.defaults?.headers?.common) {
          app.config.globalProperties.$axios.defaults.headers.common[
            'Accept-Language'
          ] = language;
        }

        // Apply locale onto HTML attributes
        document?.querySelector('html')?.setAttribute('lang', language);
      }
    });
  };
}

export default boot(({ store, app }) => {
  const i18n = createI18n({
    locale: defaultLocale,
    fallbackLocale: fallbackLocale,
    allowComposition: true,
    legacy: false,
    messages,
  });

  store.use(languageSettingsSubscriber(app, i18n));

  // Set i18n instance on app
  app.use(i18n);
});
