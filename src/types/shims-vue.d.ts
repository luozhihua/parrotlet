// declare module '*.vue' {
//   import Vue from 'vue'
//   export default Vue
// }

// Mocks all files ending in `.vue` showing them as plain Vue instances
/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// import type Axios from 'axios';
// import type { I18n } from 'vue-i18n';
// declare module '@vue/runtime-core' {
//   interface GlobalProperties {
//     $axios: typeof Axios;
//     $i18n: I18n;
//   }

//   interface ComponentCustomProperties {
//     $const: Record<string, unknown>;
//   }
// }

// export {}; // Important! See note.
