/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

const { configure } = require('quasar/wrappers');
const path = require('path');
const VueI18n = require('@intlify/unplugin-vue-i18n');
const esmodule = require('vite-plugin-esmodule');
const I18nText = require('./src-common/vite-i18n-text/index.js');
const { set } = require('lodash');

const internal = [
  'p-limit',
  '@sindresorhus/is',
  'node-emoji',
  'p-locate',
  // 'p-locate',
  // 'p-reducs',
  // 'p-try',
  // 'p-waterfall',
  // 'lodash-es',
  // 'conf',
  // 'pkg-up',
  // 'locate-path',
  // 'read-pkg-up',
];

module.exports = configure(function (ctx) {
  return {
    eslint: {
      // fix: true,
      // include: [],
      // exclude: [],
      // rawOptions: {},
      warnings: true,
      errors: true,
    },

    // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli-vite/boot-files
    boot: ['i18n', 'axios', 'hooks', 'portal-vue', 'translator'],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#css
    css: ['app.scss', 'app.dark.scss'],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v5',
      // 'fontawesome-v6',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#build
    build: {
      target: {
        browser: ['es2019'],
        node: 'node16',
      },

      vueRouterMode: 'hash', // available values: 'hash', 'history'
      // vueRouterBase,
      // vueDevtools,
      // vueOptionsAPI: false,

      // rebuildCache: true, // rebuilds Vite/linter/etc cache on startup

      // publicPath: '/',
      // analyze: true,
      // env: {},
      // rawDefine: {}
      // ignorePublicFolder: true,
      // minify: false,
      // polyfillModulePreload: true,
      // distDir
      sourceMap: true,

      extendViteConf(viteConf) {
        // set(viteConf, 'build.rollupOptions.output.format', 'cjs');
        // set(viteConf, 'build.rollupOptions.external', [
        //   ...(viteConf.build?.rollupOptions?.external || []),
        //   'electron',
        //   'fs',
        //   'path',
        // ]);
        // viteConf.build.rollupOptions.output.format = 'cjs';
        // viteConf.build.rollupOptions.external.push(
        //   ...['electron', 'fs', 'path']
        // );
      },
      // viteVuePluginOptions: {},

      vitePlugins: [
        [
          VueI18n.vite,
          {
            // if you want to use Vue I18n Legacy API, you need to set `compositionOnly: false`
            // compositionOnly: false,

            // if you want to use named tokens in your Vue I18n messages, such as 'Hello {name}',
            // you need to set `runtimeOnly: false`
            // runtimeOnly: false,

            // you need to set i18n resource including paths !
            include: path.resolve(__dirname, './src/i18n/**'),
          },
        ],
        {
          ...esmodule(internal),
          apply: 'build',
        },
        I18nText({ dir: path.resolve(__dirname, './src/i18n/langs/') }),
      ],
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
    devServer: {
      // https: true
      open: true, // opens browser window automatically
      port: ctx.mode.ssr ? 9100 : 6765,
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#framework
    framework: {
      config: {
        // brand: {
        //   primary: '#0791a3',
        //   secondary: '#5595c9',
        //   accent: '#ab36bf',
        //   dark: '#1d1d1d',
        //   'dark-page': '#121212',
        //   positive: '#52b369',
        //   negative: '#ed5567',
        //   info: '#5cc6db',
        //   warning: '#f5d069',
        // },
      },

      // iconSet: 'material-icons', // Quasar icon set
      lang: 'zh-CN', // Quasar language pack
      cssAddon: true,
      autoImportComponentCase: 'combined',

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      components: [
        'QPage',
        'QPageContainer',
        'QPagination',
        'QCard',
        'QCardActions',
        'QCardSection',
        'QSeparator',
        'QCircularProgress',
        'QLinearProgress',
        'QChip',
        'QIcon',
        'QCheckbox',
        'QSelect',
        'QInput',
        'QBtn',
        'QBadge',
        'QAvatar',
        'QBtnToggle',
        'QBtnDropdown',
        'QField',
        'QDialog',
        'QList',
        'QItem',
        'QItemLabel',
        'QItemSection',
      ],
      // directives: [],

      // Quasar plugins
      plugins: ['Dialog', 'Notify', 'Loading'],
    },

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/options/animations
    animations: 'all',

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#sourcefiles
    // sourceFiles: {
    //   rootComponent: 'src/App.vue',
    //   router: 'src/router/index',
    //   store: 'src/store/index',
    //   registerServiceWorker: 'src-pwa/register-service-worker',
    //   serviceWorker: 'src-pwa/custom-service-worker',
    //   pwaManifestFile: 'src-pwa/manifest.json',
    //   electronMain: 'src-electron/electron-main',
    //   electronPreload: 'src-electron/electron-preload'
    // },

    // https://v2.quasar.dev/quasar-cli-vite/developing-ssr/configuring-ssr
    ssr: {
      // ssrPwaHtmlFilename: 'offline.html', // do NOT use index.html as name!
      // will mess up SSR

      // extendSSRWebserverConf (esbuildConf) {},
      // extendPackageJson (json) {},

      pwa: false,

      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      middlewares: [
        'render', // keep this as last one
      ],
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: 'generateSW', // or 'injectManifest'
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,
      // useFilenameHashes: true,
      // extendGenerateSWOptions (cfg) {}
      // extendInjectManifestOptions (cfg) {},
      // extendManifestJson (json) {}
      // extendPWACustomSWConf (esbuildConf) {}
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true,
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/configuring-electron
    electron: {
      // extendElectronMainConf (esbuildConf)
      // extendElectronPreloadConf (esbuildConf)
      extendElectronPreloadConf: (config) => {
        // config.format = 'esm';
        // config.target = ['node16'];
        config.treeShaking = true;
        // config.splitting = true;
        config.external = config.external.filter(
          (ext) => !internal.some((e) => e === ext)
        );
        return config;
      },
      extendElectronMainConf: (config) => {
        // config.format = 'esm';
        // config.target = ['node16'];
        config.treeShaking = true;
        // config.splitting = true;
        config.external = config.external.filter(
          (ext) => !internal.some((e) => e === ext)
        );
        return config;
      },

      extendPackageJson(pkg) {
        // pkg.type = 'module';
        internal.forEach((i) => {
          if (pkg.dependencies[i]) delete pkg.dependencies[i];
        });
      },

      inspectPort: 5858,

      bundler: 'builder', // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        appBundleId: 'com.parrotlet.app',
        appCategoryType: 'Tool',
        // osxSign: '',
        protocol: 'parrotlet://projects',
        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: 'com.parrotlet.app',
        icon: '/Users/colin/Works/Projects/parrotlet2/public/icons',
        publish: [
          {
            provider: 'github',
            publishAutoUpdate: true,
            private: true,
            token: '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',
          },
        ],
        mac: {
          category: 'public.app-category.developer-tools',
          icon: '../public/icons/icon.icns',
        },
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
    bex: {
      contentScripts: ['my-content-script'],

      // extendBexScriptsConf (esbuildConf) {}
      // extendBexManifestJson (json) {}
    },
  };
});
