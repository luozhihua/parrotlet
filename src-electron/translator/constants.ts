import { type ClientConfig as TencentConfig } from 'tencentcloud-sdk-nodejs-common';

export enum PROVIDERS {
  google = 'google',
  azure = 'azure',
  deepl = 'deepl',
  baidu = 'baidu',
  aliyun = 'aliyun',
  huawei = 'huawei',
  tencent = 'tencent',
  youdao = 'youdao',
}
export enum POLICIES {
  alternate = 'alternate',
  randomized = 'randomized',
}

export type ProviderConfig = {
  [k in PROVIDERS]?: {
    key: k;
    endpoint?: string;
    proxyBypass?: string;
  };
};
export const PROVIDER_CONFIG: ProviderConfig = {
  [PROVIDERS.google]: { key: PROVIDERS.google, proxyBypass: '*googleapis.com' },
  [PROVIDERS.azure]: {
    key: PROVIDERS.azure,
    proxyBypass: '*microsofttranslator.com',
  },
  [PROVIDERS.deepl]: { key: PROVIDERS.deepl, proxyBypass: '*deepl.com' },
  [PROVIDERS.baidu]: { key: PROVIDERS.baidu, proxyBypass: '*baidubce.com' },
  [PROVIDERS.aliyun]: { key: PROVIDERS.aliyun, proxyBypass: '*aliyuncs.com' },
  [PROVIDERS.huawei]: {
    key: PROVIDERS.huawei,
    proxyBypass: '*huaweicloud.com',
  },
  [PROVIDERS.tencent]: {
    key: PROVIDERS.tencent,
    proxyBypass: '*tencentcloudapi.com',
  },
  [PROVIDERS.youdao]: { key: PROVIDERS.youdao, proxyBypass: '*youdao.com' },
};

export type TranslateProviderNames = keyof typeof PROVIDERS;

export interface GoogleOptions {
  /**
   * App ID or Project ID
   */
  projectId: string;
  authKeys: {
    type?: string;
    project_id?: string;
    private_key_id?: string;
    private_key?: string;
    client_email?: string;
    client_id?: string;
    auth_uri?: string;
    token_uri?: string;
    auth_provider_x509_cert_url?: string;
    client_x509_cert_url?: string;
  };
}

export interface AzureOptions {
  key: string;
  region: string;
}
export interface DeeplOptions {
  authKey: string;
}
export interface BaiduOptions {
  apiKey: string;
  secretKey: string;
  accessToken?: string;
}
export interface AliyunOptions {
  accessKeyId: string;
  accessKeySecret: string;
}

export interface HuaweiOptions {
  projectId: string;
  key: string;
  secret: string;
  region: string;
}

export interface TencentOptions {
  credential?: 'secret' | 'token';

  /**
   * App ID or Project ID
   */
  appId: string;
  client: TencentConfig;
}

export interface YoudaoOptions {
  name?: string;
}

export interface Options {
  /**
   * Names of enabled engins
   */
  engines: PROVIDERS[];

  /**
   * Fallback engind
   */
  fallbackEngine?: PROVIDERS;

  /**
   * Policy that how to choose enabled engines to translate texts
   * @default alternate
   */
  policy?: POLICIES;

  engineConfigs: {
    [K in PROVIDERS]?: K extends PROVIDERS.google
      ? GoogleOptions
      : K extends PROVIDERS.azure
      ? AzureOptions
      : K extends PROVIDERS.deepl
      ? DeeplOptions
      : K extends PROVIDERS.baidu
      ? BaiduOptions
      : K extends PROVIDERS.aliyun
      ? AliyunOptions
      : K extends PROVIDERS.tencent
      ? TencentOptions
      : K extends PROVIDERS.huawei
      ? HuaweiOptions
      : K extends PROVIDERS.youdao
      ? YoudaoOptions
      : never;
  };
}
