import TranslateBase from './base';
import GoogleTranslate from '@google-cloud/translate';
import { JWT } from 'google-auth-library';
import { type Translate } from '@google-cloud/translate/build/src/v2';
import { type GoogleOptions as Config } from './constants';

export default class extends TranslateBase<Config> {
  readonly name = 'Google';
  readonly multiple = true;
  readonly localeMaper = {};
  client: Translate;

  constructor(config: Config) {
    super(config);
    this.client = this.createClient();
  }

  createClient() {
    const authClient = new JWT({
      email: this.options.authKeys.client_email,
      key: this.options.authKeys.private_key,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    return new GoogleTranslate.v2.Translate({
      authClient: authClient,
      projectId: this.options.projectId,
    });
  }

  async request<T = string>(
    text: T,
    target: string,
    source: string
  ): Promise<string>;
  async request<T = string[]>(
    text: T,
    target: string,
    source: string
  ): Promise<string[]>;
  async request<T = string | string[]>(
    text: string | string[],
    target: string,
    source = 'auto'
  ) {
    const params = {
      // format: 'json',
      from: source,
      // model: string;
      to: target,
    };

    const cli = Array.isArray(text)
      ? this.client.translate(text as string[], params)
      : this.client.translate(text as string, params);

    return await cli.then(
      ([result]) => {
        return result as T;
      },
      (err) => {
        console.error('Google translate error: ', err);
        return '' as T;
      }
    );
  }
}
