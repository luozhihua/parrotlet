import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';
import { useProjectStore } from './useProjectStore';
import { kebabCase, set } from 'lodash-es';
import { useI18n } from 'vue-i18n';
import { electron } from '../util/electron';
import flatten, { unflatten } from 'flat';
import plimit from 'p-limit';
// import { merge } from 'lodash-es';

interface Texts {
  [localeKey: string]: string;
}
interface Languages {
  [langKey: string]: Texts;
}
interface Locales {
  projects: { [projectId: string]: Languages };
}

const limit = plimit(10);
const fs = electron.getFs();
export const ID = 'Locale';
export const useLocaleStore = defineStore(
  ID,
  () => {
    const { t } = useI18n();
    const $proj = useProjectStore();
    const state = reactive<Locales>({} as Locales);
    const langs = computed(() =>
      $proj.project ? state.projects?.[$proj.project.id] : null
    );
    const getTextsOfLang = computed(
      () => (langKey: string) => langs.value?.[langKey]
    );
    const getText = computed(
      () => (langKey: string, textKey: string) =>
        getTextsOfLang.value(langKey)?.[textKey]
    );
    const allText = computed(() => {
      const proj = $proj.project;
      if (!proj) {
        return [];
      }
      const mainLang = proj.language;
      const enableLangs = proj.enabledLanguages;
      const mainTexts = getTextsOfLang.value(mainLang);
      return mainTexts
        ? Object.entries(mainTexts).map(([k, v], i) => {
            return {
              _id: `k-${i}-${kebabCase(k).toLowerCase()}`,
              _key: k,
              [mainLang]: v,
              ...Object.fromEntries(
                enableLangs.map((l) => {
                  return [l, getText.value(l, k) || ''];
                })
              ),
            };
          })
        : [];
    });

    async function initProjectLocale(projectId: string) {
      const proj = $proj.projects.find((p) => p.id === projectId);

      if (!proj) {
        throw new Error(
          t('Project not found by id {projectId}', { projectId })
        );
      }

      const { id, path, enabledLanguages } = proj;
      set(state, `projects.${projectId}`, {});
      await Promise.all(
        enabledLanguages.map((lang: string) =>
          limit(async () => {
            const filePath = `${path}/${lang}.json`;

            if (fs.existsSync(filePath)) {
              const fileContent = await fs.promises.readFile(filePath, 'utf8');
              try {
                if (fileContent) {
                  state.projects[id][lang] = flatten(JSON.parse(fileContent));
                }
              } catch (err) {
                console.log('fileContent: ', filePath, fileContent);
              }
            } else {
              // missing.push(lang);
            }
          })
        )
      );
    }

    async function saveLang(lang: string) {
      const { path } = $proj.project || {};
      const targetTexts = getTextsOfLang.value(lang);

      if (path && targetTexts) {
        const filePath = `${path}/${lang}.json`;
        const content = unflatten(targetTexts);
        // await fs.promises.writeFile(
        //   filePath,
        //   JSON.stringify(content, null, 4),
        //   'utf8'
        // );
        console.log(`Save to ${filePath}`, content);
      }
    }

    async function saveAllLangs() {
      if (!langs.value) {
        return;
      }
      const limit = plimit(3);
      await Promise.all(
        Object.keys(langs.value).map((k) => {
          return limit(() => {
            saveLang(k);
          });
        })
      );
    }

    /**
     *
     * @param lang
     * @param force Translate unempty keys forcecally
     * @returns
     */
    async function translateLocaleFile(lang: string, force = false) {
      if (!$proj.project) {
        return;
      }
      const src = $proj.project?.language;
      const baseTexts = getTextsOfLang.value(src) || {};
      const targetTexts = getTextsOfLang.value(lang);

      let texts = Object.entries(baseTexts);
      if (force !== true) {
        texts = texts.filter(([k, v]) => {
          return !targetTexts?.[k]?.trim();
        });
      }
      const res = await electron.translate(
        texts.map(([k, v]) => v),
        lang,
        src
      );
      texts.forEach(([k, v], i) => {
        if (targetTexts) targetTexts[k] = res[i];
      });
    }

    return {
      state,
      langs,
      getTextsOfLang,
      getText,
      allText,
      initProjectLocale,
      translateLocaleFile,
      saveLang,
      saveAllLangs,
    };
  },
  {
    persist: false,
  }
);
