import * as fs from 'fs';

const _localeNames = JSON.parse(fs.readFileSync('./zh-CN-google.json'));
const _localeNames2 = JSON.parse(
  fs.readFileSync('./langs/zh-CN.json')
).localeNames;
const localeNames = Object.keys(_localeNames).concat(
  Object.keys(_localeNames2)
);
const locales = fs
  .readdirSync('./langs')
  .filter((f) => f.substr(-5) === '.json');

console.log('locales =>', locales);
locales.forEach((locale) => {
  const json = JSON.parse(fs.readFileSync(`./langs/${locale}`));
  // const entries = Object.keys(json)
  //   .filter((k) => {
  //     const drop = localeNames.some((n) =>
  //       [n, `localeNames.${n}`, `localeNames.__i18n_ally_root__.${n}`].includes(
  //         k
  //       )
  //     );
  //     drop && console.log('drop', drop, k);
  //     return !drop;
  //   })
  //   .map((k) => [k, json[k]]);
  // const dist = Object.fromEntries(entries);

  Object.keys(json).forEach((k) => {
    const drop = localeNames.some((n) =>
      [n, `localeNames.${n}`, `localeNames.__i18n_ally_root__.${n}`].includes(k)
    );

    if (drop) {
      delete json[k];
    }
  });

  // console.log(JSON.stringify(json, null, 4));
  console.log();
  console.log();

  fs.writeFileSync(`./langs/${locale}`, JSON.stringify(json, null, 2));
});
