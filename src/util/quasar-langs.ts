const QUASAR_LANG_ISO: { [k: string]: string } = {
  en: 'en-US',
  'en-US': 'en-US',
  'en-GB': 'en-GB',
  zh: 'zh-CN',
  'zh-cn': 'zh-CN',
  zh_cn: 'zh-CN',
  zh_CN: 'zh-CN',
  'zh-HANS': 'zh-CN',
  'zh-hans': 'zh-CN',
  'zh-tw': 'zh-TW',
  'zh-HK': 'zh-TW',
  'zh-MO': 'zh-TW',
  'zh-SG': 'zh-TW',
  'zh-HANT': 'zh-TW',
  'zh-hant': 'zh-TW',
  'pt-PT': 'pt',
  'pt-br': 'pt-BR',
  'nb-no': 'nb-NO',
  'nn-no': 'nb-NO',
  'ko-KR': 'ko-kr',
  ko: 'ko-KR',
  'ko-kr': 'ko-KR',
};
export async function importQuasarLang(lang: string | { value: string }) {
  lang = typeof lang === 'string' ? lang : lang.value;
  const langAlias = QUASAR_LANG_ISO[lang] || lang;
  const langPack = await import(`../../node_modules/quasar/lang/${langAlias}`);
  return langPack.default;
}
