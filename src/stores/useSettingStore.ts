import { defineStore } from 'pinia';
import languages from 'src/i18n/langs/languages.json';
import pick from 'lodash-es/pick';

export type DarkMode = 'dark' | 'light' | 'auto';
export interface Proxy {
  enable: boolean;
  type?: 'http' | 'https' | 'socks' | 'pac';
  http?: string;
  https?: string;
  socks?: string;
  pac?: string;
  bypass?: string[];
  exclude?: string[];
}

export interface Setting {
  darkMode?: DarkMode;
  language?: string;
  languages?: typeof languages;
  proxy?: Proxy;
}

export const ID = 'setting';
export const useSettingStore = defineStore(ID, {
  state() {
    return {
      darkMode: 'auto' as DarkMode,
      language: 'en',
      languages,
      proxy: {
        enable: false,
        bypass: [],
        exclude: [],
      } as Proxy,
    };
  },

  getters: {
    allSettings(state) {
      return pick(state, ['darkMode', 'language', 'languages', 'proxy']);
    },
  },

  actions: {
    // Magrated from VueX Mutations
    updateMode(mode: DarkMode = 'auto') {
      this.darkMode = mode;
    },

    updateLanguage(locale: string) {
      if (locale) {
        this.language = locale;
      }
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    patchSettings(settings: Record<string, any> = {}) {
      Object.keys(settings).forEach((k) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this as any)[k] = settings[k];
      });
    },

    updateProxy(proxy: Proxy) {
      Object.assign(this.proxy, proxy);
    },
  },
});
