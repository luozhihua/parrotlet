/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > dependencies and NOT in devDependencies
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   import { contextBridge } from 'electron'
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 *
 * WARNING!
 * If accessing Node functionality (like importing @electron/remote) then in your
 * electron-main.ts you will need to set the following when you instantiate BrowserWindow:
 *
 * mainWindow = new BrowserWindow({
 *   // ...
 *   webPreferences: {
 *     // ...
 *     sandbox: false // <-- to be able to import @electron/remote in preload script
 *   }
 * }
 */

import {
  app,
  contextBridge,
  ipcRenderer,
  clipboard,
  type OpenDialogOptions,
} from 'electron';
import { getEnv, setEnv, updateGoogleAppCredentials } from './apis/env';
import { resolveProxy } from './apis/proxy';
import storage, { piniaPersistence } from './apis/storage';
import * as fs from 'fs';
import * as path from 'path';
import { type Options } from './translator/constants';

// import remote from '@electron/remote/dist/src/renderer/remote';
// 'electron' will be available on the global window context
contextBridge.exposeInMainWorld('electron', {
  reopenWindow: async function () {
    ipcRenderer.invoke('relaunch');
  },

  getFs() {
    return fs;
  },

  getPath() {
    return path;
  },

  axiosRequest(...args: any) {
    const result = ipcRenderer
      .invoke('axios.request', JSON.stringify(args))
      .catch((resp) => console.warn(resp));
    return result;
  },

  openFileDialog: async (options: OpenDialogOptions) => {
    return await ipcRenderer.invoke('openFileDialog', options);
  },

  getLocale() {
    return app.getLocale();
  },
  getLocaleCountryCode() {
    return app.getLocaleCountryCode();
  },
  getSystemLocale() {
    return app.getSystemLocale();
  },

  async proxyChanged() {
    await ipcRenderer.invoke('proxyChanged');
  },

  showItemInFolder(fullPath: string) {
    ipcRenderer.invoke('showItemInFolder', fullPath);
  },

  async initTranslator(options: Options) {
    await ipcRenderer.invoke('initTranslator', options);
  },
  async translate(...args: string[]) {
    return JSON.parse(await ipcRenderer.invoke('translate', ...args));
  },
  async translateByEngine(...args: string[]) {
    return JSON.parse(await ipcRenderer.invoke('translateByEngine', ...args));
  },
  copy(text: string) {
    clipboard.writeText(text);
  },
  resolveProxy,

  storage: piniaPersistence,

  setEnv,

  getEnv,

  updateGoogleAppCredentials,
});
