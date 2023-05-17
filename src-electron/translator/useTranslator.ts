import { Translator } from './index';
import { Options } from './constants';
// import { useTranslateStore } from '../../src/stores/useTranslatorStore';
import { PROVIDERS } from './constants';
// import { merge, pick } from 'lodash-es';

let translator: Translator | null = null;
export function useTranslator(options?: Partial<Options>) {
  // const store = useTranslateStore();
  // const defaultOptions: Options = store.$state;
  const config = Object.assign({}, options) as Options;
  if (translator) {
    translator.init(config);
  } else {
    translator = new Translator(config);
    translator.init();
  }
  return translator;
}

export async function translateByEngine(
  engineName: PROVIDERS,
  text: string,
  target: string,
  source = 'auto'
) {
  return await translator?.translateByEngine(engineName, text, target, source);
}

export async function translate(text: string, target: string, source = 'auto') {
  return await translator?.translate(text, target, source);
}
