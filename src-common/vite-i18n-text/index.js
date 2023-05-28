const fs = require('fs');
const path = require('path');
const { flatten } = require('flat');
const Case = require('case');
const { set } = require('lodash');
const { MSG } = require('./protocol.cjs');

module.exports = function HederaRouter(options) {
  function addLocaleTexts(texts) {
    const { dir } = options;
    Object.entries(texts).forEach(([key, lang]) => {
      const file = path.join(dir, `${lang}.json`);
      const json = flatten(JSON.parse(fs.readFileSync(file, 'utf8')));
      set(json, key, Case.sentence(key));
      fs.writeFileSync(file, JSON.stringify(json, null, 4), 'utf8');
    });
  }

  return {
    name: 'i18n-text',
    apply: 'serve',

    configureServer(server) {
      server.ws.on(MSG.missing, ({ id, texts }) => {
        console.log('Message from client:', id, texts); // Hey!
        texts && addLocaleTexts(texts);
      });
    },

    resolveId(source, importer, _options) {
      if (
        source === 'vite-i18n-text/client.mjs' &&
        importer &&
        importer.endsWith('index.html')
      ) {
        return path.resolve(importer.replace(/[\/\\]index.html$/, ''), source);
      }
    },

    transformIndexHtml: {
      enforce: 'pre',
      async transform(html, ctx) {
        html = html.replace(
          '</head>',
          `
          <script type="module" src="./src-common/vite-i18n-text/client.ts"></script>
          </head>
          `
        );
        return {
          html,
          tags: [],
        };
      },
    },
  };
};
