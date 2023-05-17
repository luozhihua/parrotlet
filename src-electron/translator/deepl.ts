import * as deepl from 'deepl-node';
import TranslateBase from './base';
import { type DeeplOptions as Config } from './constants';
import { SourceLanguageCode, TargetLanguageCode } from 'deepl-node';

interface Result {
  translations: Array<{
    detected_source_language: string;
    text: string;
  }>;
}

export default class extends TranslateBase<Config> {
  name = 'Azure';
  localeMaper = {};
  client?: deepl.Translator;

  constructor(config: Config) {
    super(config);

    this.client = this.createClient();
  }

  createClient() {
    if (this.options?.authKey) {
      return new deepl.Translator(this.options?.authKey);
    }
  }

  async request(text: string, target: string, source?: string) {
    if (!this.client) {
      this.client = this.createClient();
    }
    const result = await this.client?.translateText(
      text,
      (source as SourceLanguageCode) || null,
      target as TargetLanguageCode
    );
    return result?.text || '';
  }
}
