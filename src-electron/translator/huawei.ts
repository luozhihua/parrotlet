import axios, { AxiosResponse, type AxiosRequestConfig } from 'axios';
import TranslateBase from './base';
import { type HuaweiOptions as Config } from './constants';
import { RequestOption, Signer } from './sdk/huawei/signer';

interface Result {
  src_text: string;
  translated_text: string;
  from: string;
  to: string;
}

export default class extends TranslateBase<Config> {
  name = 'Huawei';
  #api: string;
  localeMaper = {};

  constructor(config: Config) {
    super(config);
    const { region, projectId } = this.options;
    const path = 'machine-translation/text-translation';
    this.#api = `https://nlp-ext.${region}.myhuaweicloud.com/v1/${projectId}/${path}`;
  }

  getRequestOptions(data: Record<string, any>) {
    const { key, secret, projectId } = this.options;
    const signer = new Signer(key, secret);
    //The following example shows how to set the request URL and parameters to query a VPC list.
    const requestOptions = new RequestOption('POST', this.#api, {
      'X-Project-Id': projectId,
    });

    //Add a body if you have specified the PUT or POST method. Special characters, such as the double quotation mark ("), contained in the body must be escaped.
    requestOptions.body = JSON.stringify(data);

    return signer.Sign(requestOptions);
  }

  async request(text: string, target: string, source?: string) {
    const data = {
      text,
      from: source?.split(/[-_]/).shift(),
      to: target.split(/[-_]/).shift(),
      scene: 'common',
    };
    const opts = this.getRequestOptions(data);
    const axiosOptions: AxiosRequestConfig = {
      url: this.#api,
      method: opts.method,
      headers: opts.headers,
      data,
      responseType: 'json',
    };

    const response = await axios<any, AxiosResponse<Result>>(axiosOptions);
    const result = response.data?.translated_text;
    return result;
  }
}
