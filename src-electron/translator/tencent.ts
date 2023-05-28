// Depends on tencentcloud-sdk-nodejs version 4.0.3 or higher
import { type TencentOptions as Config } from './constants';
import { TextTranslateRequest } from 'tencentcloud-sdk-nodejs-tmt/tencentcloud/services/tmt/v20180321/tmt_models';
import { Client } from 'tencentcloud-sdk-nodejs-tmt/tencentcloud/services/tmt/v20180321/tmt_client';
import TranslateBase from './base';

export default class extends TranslateBase<Config> {
  name = 'Tencent';
  localeMaper = {};
  client: Client;

  constructor(config: Config) {
    super(config);
    this.client = this.createClient();
  }

  createClient() {
    return new Client(this.options.client);
  }

  async request(text: string, target: string, source = 'auto') {
    const params: TextTranslateRequest = {
      SourceText: text,
      Source: source.split(/[-_]/).shift() || 'auto',
      Target: target.split(/[-_]/).shift() || '',
      ProjectId: parseInt(this.options.appId, 10),
    };

    return await this.client.TextTranslate(params).then(
      (data) => {
        return data.TargetText || '';
      },
      (err) => {
        console.error('error', err);
        return '';
      }
    );
  }
}
