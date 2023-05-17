import { computed } from 'vue';
import {
  PROVIDERS,
  TranslateProviderNames,
} from '../../src-electron/translator/constants';
import { upperFirst } from 'lodash-es';
import { useTranslateStore } from '../stores/useTranslateStore';

const transStore = useTranslateStore();

export type ResultOfProvider = {
  [k in TranslateProviderNames]?: {
    result?: string;
    status: 'normal' | 'loading' | 'success' | 'error';
    provider: TranslateProviderNames;
  };
};
export type ResultMapOfProvider = {
  [k: string]: ResultOfProvider;
};
export type ProviderResult = {
  status: 'normal' | 'loading' | 'success' | 'error';
  text: string;
  provider: TranslateProviderNames;
};
export type Provider = {
  key: PROVIDERS;
  name: string;
  enable: boolean;
  texts: {
    [k: string]: ProviderResult;
  };
};

export default function useProvider() {
  const enabledProviders = transStore.engines;
  const providers = computed<Provider[]>(() => {
    return Object.values(PROVIDERS)
      .sort((a, b) => enabledProviders.indexOf(b) - enabledProviders.indexOf(a))
      .map((provider) => ({
        key: provider,
        name: upperFirst(provider),
        enable: enabledProviders.includes(provider),
        texts: {},
      }));
  });

  return { providers, enabledProviders };
}
