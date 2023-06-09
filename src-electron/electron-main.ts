import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  dialog,
  ipcMain,
  nativeTheme,
  session,
  shell,
} from 'electron';
// import { checkForUpdates } from "./upgrade"
import { autoUpdater } from 'electron-updater';
import path from 'path';
import os from 'os';
import { initialize, enable } from '@electron/remote/main';
import storage, { piniaPersistence } from './apis/storage';
import { setEnv } from './apis/env';
import { resolveProxy } from './apis/proxy';
import axios from 'axios';
import {
  translate,
  translateByEngine,
  useTranslator,
} from './translator/useTranslator';
import { PROVIDERS } from './translator/constants';

initialize();
console.log('app.getPath("userData") => ', app.getPath('userData'));
console.log('app.getPath("desktop") => ', app.getPath('desktop'));

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();
const windows: { [k: number]: BrowserWindow } = {};
// const proxy = storage.get('setting.proxy') as Record<string, string>;
let currentWindow: BrowserWindow | undefined;

try {
  if (platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
    require('fs').unlinkSync(
      path.join(app.getPath('userData'), 'DevTools Extensions')
    );
  }
} catch (_) {}

function onAppReady() {
  session.defaultSession.allowNTLMCredentialsForDomains('*');
  // Resolve proxy
  resolveProxy();
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
}

async function createWindow(
  options: BrowserWindowConstructorOptions | void = {},
  url?: string
) {
  let mainWindow: BrowserWindow | undefined;
  const { width = 1000, height = 800 } = options || {};

  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(__dirname, 'icons/icon.png'), // tray icon
    width,
    height,
    frame: false,
    titleBarStyle: 'hidden',
    useContentSize: true,
    backgroundColor: '#222',
    webPreferences: {
      sandbox: false, // <-- to be able to import @electron/remote in preload script
      nodeIntegration: true,
      experimentalFeatures: true,
      // we enable contextIsolation (Electron 12+ has it enabled by default anyway)
      contextIsolation: true,
      // we use a new way to reference the preload script
      // (it's going to be needed, so add it and create the file if it's not there already)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD!),

      // scrollBounce: true,
      nodeIntegrationInSubFrames: true, //for subContent nodeIntegration Enable
      webviewTag: true, //for webView
    },
  });

  url = url || process.env.APP_URL;
  windows[mainWindow.id] = mainWindow;

  enable(mainWindow.webContents); // <-- add this
  await resolveProxy(mainWindow.webContents.session);
  url && mainWindow.loadURL(url);

  mainWindow.on(
    'closed',
    ((id) => () => {
      if (windows[id]) {
        delete windows[id];
      }
      mainWindow = undefined;
    })(mainWindow.id)
  );

  mainWindow.on('focus', () => {
    currentWindow = mainWindow;
  });

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools();
    });
  }
}

app.whenReady().then(onAppReady);

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (Object.keys(windows).length === 0) {
    createWindow();
  }
});

ipcMain.handle('getOptions', async () => {
  const res = !currentWindow
    ? {}
    : {
        id: currentWindow.id,
        url: currentWindow.webContents.getURL(),
        size: currentWindow.getSize(),
        locale: app.getLocale(),
        contry: app.getLocaleCountryCode(),
      };
  return res;
});

ipcMain.handle('relaunch', async () => {
  if (currentWindow) {
    const [width, height] = currentWindow.getSize();
    const [x, y] = currentWindow.getPosition();
    createWindow(
      {
        width,
        height,
        x,
        y,
        parent: currentWindow.getParentWindow() || undefined,
      },
      currentWindow.webContents.getURL()
    );

    currentWindow.close();
  }
});

ipcMain.handle('axios.request', async (event, serializeOptions: string) => {
  const args = JSON.parse(serializeOptions);
  const result = await (axios as any)(...args);
  return result.data;
});

ipcMain.handle(
  'openFileDialog',
  async (event, options: Record<string, any>) => {
    return (await dialog.showOpenDialog(options)).filePaths;
  }
);

ipcMain.handle('proxyChanged', async (_e) => {
  resolveProxy();
  for (const id in windows) {
    const win = windows[id];
    resolveProxy(win.webContents.session);
  }
});

ipcMain.handle('showItemInFolder', async (_e, fullPath: string) => {
  shell.showItemInFolder(fullPath);
});

ipcMain.handle('initTranslator', async (_e, opt: string) => {
  opt = JSON.parse(opt);
  useTranslator(opt as any);
});
ipcMain.handle(
  'translate',
  async (_e, text: string, target: string, source?: string) => {
    const res = await translate(text, target, source);
    return JSON.stringify(res);
  }
);
ipcMain.handle(
  'translateByEngine',
  async (
    _e,
    engine: PROVIDERS,
    text: string,
    target: string,
    source?: string
  ) => {
    const res = await translateByEngine(engine, text, target, source);

    console.log('ipcMain.translateByEngine() => ', res);
    return JSON.stringify(res);
  }
);
