// import { Project } from './../stores/useProjectStore';
// import { electron } from './electron';
// import flatten, { unflatten } from 'flat';

// const fs = electron.getFs();
// const { join } = electron.getPath();

// /**
//  * 从文件系统加载指定项目下语言的翻译项
//  *
//  * @export
//  * @param {Project} project
//  * @param {string} lang
//  * @returns {*}
//  */
// export async function loadTextsOfLang(
//   project: Project,
//   lang: string
// ): Promise<any> {
//   const { path } = project;
//   const filepath = join(path, `${lang}.json`);

//   (loadTextsOfLang as any).cache = (loadTextsOfLang as any).cache || {};
//   const cached = (loadTextsOfLang as any).cache[filepath];
//   if (cached && Date.now() - (cached.time || 0) < 3000) {
//     return cached.json;
//   } else {
//     const text = await fs.promises.readFile(filepath, 'utf8');
//     const json = flatten(JSON.parse(text || '{}'));
//     (loadTextsOfLang as any).cache[filepath] = { time: Date.now(), json };
//     return json;
//   }
// }

// /**
//  * 统计指定语言的翻译进度
//  *
//  * @export
//  * @param {Project} project
//  * @param {string} lang
//  * @param {{base: any, target: any}} [data]
//  * @returns
//  */
// export type TranslateProcess = {
//   base: number;
//   target: number;
//   value: number;
//   percent: number;
// };
// export async function countTranslateProcess(
//   project: Project,
//   lang: string,
//   data?: { base: any; target: any }
// ): Promise<TranslateProcess> {
//   let base: { [k: string]: string };
//   let target: { [k: string]: string };

//   if (data) {
//     base = data.base;
//     target = data.target;
//   } else {
//     base = await loadTextsOfLang(project, project.language);
//     target = await loadTextsOfLang(project, lang);
//   }

//   const emptyFilter = (v: any) => !!v && v.trim().length > 0;
//   const baseValues: string[] = Object.values(base).filter(emptyFilter);
//   const targetValues: string[] = Object.values(target).filter(emptyFilter);
//   const val = parseFloat((targetValues.length / baseValues.length).toFixed(2));

//   return {
//     base: baseValues.length,
//     target: targetValues.length,
//     value: val,
//     percent: val * 100,
//   };
// }

// export async function saveTargetText(
//   project: Project,
//   lang: string,
//   texts: any
// ) {
//   const { path, language } = project;
//   const filePath = join(path, `${lang}.json`);

//   if (lang !== language) {
//     const content = unflatten(texts);
//     await fs.promises.writeFile(
//       filePath,
//       JSON.stringify(content, null, 4),
//       'utf8'
//     );
//     console.log(`updated ${filePath}`);
//   }
// }

export default {};
