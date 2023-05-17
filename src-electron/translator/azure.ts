import axios, { AxiosResponse, type AxiosRequestConfig } from 'axios';
import { v4 as uuid } from 'uuid';
import TranslateBase from './base';
import { type AzureOptions as Config } from './constants';

interface Result {
  detectedLanguage: { language: string; score: number };
  translations: Array<{ text: string; to: string }>;
}

const ENDPOINT = 'https://api.cognitive.microsofttranslator.com';

export default class extends TranslateBase<Config> {
  readonly name = 'Azure';
  readonly multiple = true;
  localeMaper = {};

  constructor(config: Config) {
    super(config);
  }

  async request<T = string | string[]>(
    text: T,
    target: string,
    source?: string
  ) {
    const data = Array.isArray(text)
      ? text.map((t) => ({ text: t }))
      : [{ text }];
    const traceId = uuid().toString();
    const axiosOptions: AxiosRequestConfig = {
      baseURL: ENDPOINT.replace(/\/\s*$/, ''),
      url: '/translate',
      method: 'post',
      headers: {
        'Ocp-Apim-Subscription-Key': this.options.key,
        'Ocp-Apim-Subscription-Region': this.options.region,
        'Content-type': 'application/json',
        'X-ClientTraceId': traceId,
      },
      params: {
        'api-version': '3.0',
        from: source,
        to: target,
      },
      data,
      responseType: 'json',
    };

    const response = await axios<any, AxiosResponse<Result[]>>(axiosOptions);
    const result = Array.isArray(text)
      ? response.data?.map((d) => d.translations?.[0].text)
      : response.data?.[0]?.translations?.[0]?.text;
    return result as T;
  }
}
