import Alimt20181012, * as $alimt20181012 from '@alicloud/alimt20181012';
import * as $OpenApi from '@alicloud/openapi-client';
import Util, * as $Util from '@alicloud/tea-util';

import TranslateBase from './base';
import { type AliyunOptions as Config } from './constants';

export default class extends TranslateBase<Config> {
  readonly name = 'Aliyun';
  localeMaper = {};
  client: Alimt20181012;

  constructor(config: Config) {
    super(config);
    this.client = this.createClient();
  }

  createClient() {
    const { accessKeyId, accessKeySecret } = this.options;
    const config = new $OpenApi.Config({ accessKeyId, accessKeySecret });
    config.endpoint = 'mt.aliyuncs.com';

    return new Alimt20181012(config);
  }

  async request<T = string>(text: T, target: string, source = '') {
    const params = {
      scene: 'general',
      formatType: 'text',
      sourceLanguage:
        source.toLowerCase() !== 'zh-tw'
          ? source.split(/[-_]/).shift()
          : source,
      targetLanguage:
        target.toLowerCase() !== 'zh-tw'
          ? target.split(/[-_]/).shift()
          : target,
      sourceText: text,
    };

    const request = new $alimt20181012.TranslateGeneralRequest(params);
    try {
      const response = await this.client.translateGeneralWithOptions(
        request,
        new $Util.RuntimeOptions({})
      );
      return response.body.data?.translated || '';
    } catch (error: any) {
      // 如有需要，请打印 error
      Util.assertAsString(error.message);
      return '';
    }
  }
}
