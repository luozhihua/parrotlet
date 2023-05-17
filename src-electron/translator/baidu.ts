import axios, { AxiosResponse, type AxiosRequestConfig } from 'axios';
import TranslateBase from './base';
import { type BaiduOptions as Config } from './constants';
import { getAccessToken } from './sdk/baidu';

interface Result {
  result: {
    from: string;
    trans_result: Array<{ dst: string; src: string }>;
    to: string;
  };
  log_id: 1654529691379948800;
}

export default class extends TranslateBase<Config> {
  name = 'Baidu';
  localeMaper = {
    'zh-TW': 'cht',
  };

  constructor(config: Config) {
    super(config);
  }

  async request(text: string, target: string, source?: string) {
    const { apiKey, secretKey } = this.options;
    const accessToken = await getAccessToken(apiKey, secretKey);
    const url = 'https://aip.baidubce.com/rpc/2.0/mt/texttrans/v1';
    const data = {
      from: TranslateBase.getLangCode(source || '', ['zh-TW']),
      to: TranslateBase.getLangCode(target, ['zh-TW']),
      q: text,
    };
    const axiosOptions: AxiosRequestConfig = {
      url,
      method: 'post',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      params: {
        access_token: accessToken,
      },
      data,
      responseType: 'json',
    };

    const response = await axios<any, AxiosResponse<Result>>(axiosOptions).then(
      (a) => a,
      (err) => {
        console.error('BAIDU Translate error: ', err);
        return err.response;
      }
    );
    const result = response?.data?.result?.trans_result?.[0]?.dst;
    return result;
  }
}
