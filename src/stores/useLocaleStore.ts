import { defineStore } from 'pinia';
import { computed, reactive, ref } from 'vue';
import { useProjectStore } from './useProjectStore';
import { kebabCase, set } from 'lodash-es';
import { useI18n } from 'vue-i18n';
import { electron } from '../util/electron';
import flatten, { unflatten } from 'flat';
import pLimit from '../../src-common/plimit';
import { PROVIDERS } from '../../src-electron/translator/constants';
// import { merge } from 'lodash-es';

interface Texts {
  [localeKey: string]: string;
}
interface Language {
  [langKey: string]: Texts;
}
interface State {
  projects: { [projectId: string]: Language };
}

/**
 * 统计指定语言的翻译进度
 *
 * @export
 * @param {Project} project
 * @param {string} lang
 * @param {{base: any, target: any}} [data]
 * @returns
 */
export type TranslateProgress = {
  base: number;
  target: number;
  value: number;
  percent: number;
};

const limit = pLimit(10);
const fs = electron.getFs();
export const ID = 'Locale';
export const useLocaleStore = defineStore(
  ID,
  () => {
    const { t } = useI18n();
    const $proj = useProjectStore();
    const state = reactive<State>({
      projects: {},
    } as State);
    const project = computed<Language | null>(() =>
      $proj.project ? state.projects?.[$proj.project.id] : null
    );
    const baseTexts = computed<Texts>(
      () =>
        ($proj.project ? project.value?.[$proj.project.language] : {}) as Texts
    );
    const getTextsOfLang = computed(
      () => (langKey: string) => project.value?.[langKey] || ({} as Texts)
    );
    const getText = computed(
      () => (langKey: string, textKey: string) =>
        getTextsOfLang.value(langKey)?.[textKey]
    );

    const getProgress = computed(
      () =>
        (
          projectId: string,
          lang: string,
          data?: { base: Texts; target: Texts }
        ) => {
          const langsOfProj = state.projects[projectId] || {};
          const base =
            data?.base || langsOfProj?.[$proj.project?.language] || {};
          const target = data?.target || langsOfProj?.[lang] || {};
          const emptyFilter = (v: any) => !!v && v.trim().length > 0;
          const baseValues: string[] = Object.values(base).filter(emptyFilter);
          const targetValues: string[] =
            Object.values(target).filter(emptyFilter);
          const val = parseFloat(
            (targetValues.length / baseValues.length).toFixed(2)
          );

          return isNaN(val) ? 0 : val;
        }
    );
    const allTextOfProject = computed(() => {
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

    async function readTextsOfLang(lang: string, projectId?: string) {
      const proj = projectId
        ? $proj.projects.find((p) => p.id === projectId)
        : $proj.project;

      if (!proj || state.projects?.[proj.id]?.[lang]) {
        return;
      }
      const { path } = proj;
      const filePath = `${path}/${lang}.json`;
      if (fs.existsSync(filePath)) {
        const fileContent = await fs.promises.readFile(filePath, 'utf8');
        try {
          if (fileContent) {
            return JSON.parse(fileContent);
          }
        } catch (err) {
          console.log('fileContent: ', filePath, fileContent);
        }
      } else {
        // missing.push(lang);
      }
    }

    function getProject(projectId?: string) {
      return projectId
        ? $proj.projects.find((p) => p.id === projectId)
        : $proj.project;
    }

    async function loadTextsOfLang(lang: string, projectId?: string) {
      const proj = getProject(projectId);
      if (!proj || state.projects?.[proj.id]?.[lang]) {
        return;
      }
      const content = await readTextsOfLang(lang, projectId);
      set(state, `projects.${proj.id}.${lang}`, flatten(content));
    }

    async function loadProjectLocale(projectId: string) {
      const proj = $proj.projects.find((p) => p.id === projectId);
      if (!proj) {
        throw new Error(
          t('Project not found by id {projectId}', { projectId })
        );
      }
      const { enabledLanguages } = proj;
      await loadTextsOfLang($proj.project?.language);

      const a: any = {};
      await Promise.all(
        enabledLanguages
          .filter((l) => l !== $proj.project.language)
          .map((lang: string) =>
            limit(async () => {
              // await loadTextsOfLang(lang);
              const content = await readTextsOfLang(lang);
              if (!!content) {
                a[lang] = flatten(content);
              }
            })
          )
      );
      state.projects[proj.id] = state.projects[proj.id] || {};
      Object.assign(state.projects[proj.id], a);
    }

    async function save(lang: string) {
      const { path } = $proj.project || {};
      const targetTexts = getTextsOfLang.value(lang);

      if (path && targetTexts) {
        const filePath = `${path}/${lang}.json`;
        const content = unflatten(targetTexts);
        await fs.promises.writeFile(
          filePath,
          JSON.stringify(content, null, 4),
          'utf8'
        );
        console.log(`Save to ${filePath}`, content);
      }
    }

    async function saveAllLangs() {
      if (!project.value) {
        return;
      }
      const limit = pLimit(3);
      await Promise.all(
        Object.keys(project.value).map((k) => {
          return limit(() => {
            save(k);
          });
        })
      );
    }

    async function translate(
      key: string | string[],
      lang: string,
      provider?: PROVIDERS
    ) {
      const text = Array.isArray(key)
        ? key.map((k) => baseTexts?.value?.[k])
        : baseTexts?.value?.[key];

      if ((Array.isArray(text) && text.length > 0) || text) {
        const src = $proj.project?.language;
        const targetTexts = getTextsOfLang.value(lang);
        const result = await (provider
          ? electron.translateByEngine(provider, text, lang, src)
          : electron.translate(text, lang, src));

        if (targetTexts) {
          if (Array.isArray(key)) {
            (result as string[]).forEach((res, i) => {
              const k = key[i];
              targetTexts[k] = res;
            });
          } else {
            targetTexts[key] = result as string;
          }
        }
      }
    }

    function removeText(key: string, projectId?: string) {
      const proj = getProject(projectId);

      // Remove text of other languages
      proj?.enabledLanguages
        .filter((l) => l !== proj?.language)
        .forEach((lang) => {
          if (state.projects[proj.id]?.[lang]?.[key]) {
            delete state.projects[proj.id][lang][key];
          }
        });

      // Remove text of main language specified by project
      if (proj?.language && state.projects[proj.id]?.[proj?.language]?.[key]) {
        delete state.projects[proj.id][proj.language][key];
      }
    }

    async function addText(key: string, text: string, shouldTranslate = false) {
      const proj = getProject();
      proj?.enabledLanguages.forEach((lang) => {
        const content = lang === proj.language ? text : '';
        state.projects[proj.id][lang][key] = content;
      });

      if (shouldTranslate) {
        const limit = pLimit(6);
        const lang = $proj.project.language;
        const langs = $proj.project.enabledLanguages.filter((l) => l !== lang);
        await Promise.all(
          langs.map((l) =>
            limit(async () => {
              await translate(key, l);
            })
          )
        ).catch((e) => console.error(e));
      }
    }

    async function addLanguage(
      lang: string | string[],
      shouldTranslate = false
    ) {
      const proj = getProject();
      const langs = Array.isArray(lang) ? lang : [lang];
      proj?.enabledLanguages?.push(...langs);

      if (shouldTranslate) {
        const keys = Object.keys(baseTexts);
        await Promise.all(
          langs.map((lang) =>
            limit(async () => {
              await translate(keys, lang);
            })
          )
        );
      }
    }

    async function removeLanguage(lang: string, removeFile = true) {
      const proj = getProject();

      if (proj) {
        if (lang !== proj.language) {
          proj.enabledLanguages = proj.enabledLanguages.filter(
            (l) => l !== lang
          );
        }

        if (state.projects[proj.id]?.[lang]) {
          delete state.projects[proj.id][lang];
        }
      }

      if (removeFile) {
        const file = `${proj?.path}/${lang}.json`;
        await fs.promises.unlink(file);
      }
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

    async function translateEmptyFieldsOfProject(projectId?: string) {
      const proj = projectId
        ? $proj.projects.find((p) => p.id === projectId)
        : $proj.project;

      if (proj) {
        await Promise.all(
          proj.enabledLanguages.map((lang) =>
            limit(async () => {
              await translateLocaleFile(lang);
            })
          )
        );
      }
    }

    return {
      state,
      project,
      baseTexts,
      getTextsOfLang,
      getText,
      allTextOfProject,
      loadProjectLocale,
      translateEmptyFieldsOfProject,
      translateLocaleFile,
      translate,
      save,
      saveAllLangs,
      getProgress,
      addText,
      removeText,
      addLanguage,
      removeLanguage,
    };
  },
  {
    persist: false,
  }
);
