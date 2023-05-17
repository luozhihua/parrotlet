import { defineStore } from 'pinia';
// import { merge } from 'lodash-es';
import {
  POLICIES,
  PROVIDERS,
  type Options,
} from '../../src-electron/translator/constants';

export const ID = 'translator';
export const useTranslateStore = defineStore<typeof ID, Options, any, any>(ID, {
  state: () => ({
    engines: [] as PROVIDERS[],
    engineConfigs: {},
    fallbackEngine: PROVIDERS.google,
    policy: POLICIES.alternate,
  }),

  getters: {
    enabledEngines(state: Options) {
      return Object.keys(state.engineConfigs);
    },
  },

  actions: {},
});
