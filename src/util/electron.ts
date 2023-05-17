import type ElectronStore from 'electron-store';
import { PROVIDERS } from '../../src-electron/translator/constants';
import { Proxy } from '../stores/useSettingStore';
import { StorageLike } from 'pinia-plugin-persistedstate';

/* eslint-disable @typescript-eslint/indent */
export interface FileFilter {
  name: string;
  extensions: string[];
}

export interface OpenDialogOptions {
  title?: string;
  defaultPath?: string;
  /**
   * Custom label for the confirmation button, when left empty the default label will
   * be used.
   */
  buttonLabel?: string;
  filters?: FileFilter[];
  /**
   * Contains which features the dialog should use. The following values are
   * supported:
   */
  properties?: Array<
    | 'openFile'
    | 'openDirectory'
    | 'multiSelections'
    | 'showHiddenFiles'
    | 'createDirectory'
    | 'promptToCreate'
    | 'noResolveAliases'
    | 'treatPackageAsDirectory'
  >;
  /**
   * Message to display above input boxes.
   *
   * @platform darwin
   */
  message?: string;
  /**
   * Create security scoped bookmarks when packaged for the Mac App Store.
   *
   * @platform darwin,mas
   */
  securityScopedBookmarks?: boolean;
}

export interface Electron {
  openFileDialog: (options: OpenDialogOptions) => Promise<string[]>;
  setEnv: (key: string, value: string) => void;
  getEnv: (key: string) => string | undefined;
  updateGoogleAppCredentials: (path: string) => void;
  storage: StorageLike;
  resolveProxy: () => Promise<void>;
  reopenWindow: () => Promise<void>;
  getLocale: () => string;
  getLocaleCountryCode: () => string;
  getSystemLocale: () => string;
  axiosRequest: (...args: any[]) => any;
  getTranslatorClient: (options: Record<string, any>) => any;
  getFs: () => any;
  getPath: () => any;
  initTranslator: (options: any) => Promise<void>;
  showItemInFolder: (fullPath: string) => Promise<void>;
  proxyChanged: () => Promise<void>;
  copy: (text: string) => void;
  translateByEngine: (
    engine: PROVIDERS,
    text: string | string[],
    target: string,
    source?: string
  ) => Promise<string>;

  translate: <T = string | string[]>(
    text: T,
    target: string,
    source?: string
  ) => Promise<T>;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
export const electron: Electron = (window as unknown as { electron: Electron })
  .electron;
