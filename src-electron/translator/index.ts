import { type Options, POLICIES, PROVIDERS } from './constants';
import { default as GoogleEngine } from './google';
import { default as AzureEngine } from './azure';
import { default as DeeplEngine } from './deepl';
import { default as BaiduEngine } from './baidu';
import { default as AliyunEngine } from './aliyun';
import { default as TencentEngine } from './tencent';
import { default as HuaweiEngine } from './huawei';
import { default as YoudaoEngine } from './youdao';
import chalk from 'chalk';
import emoji from 'node-emoji';

export type Engines = {
  [K in PROVIDERS]?: K extends PROVIDERS.google
    ? GoogleEngine
    : K extends PROVIDERS.azure
    ? AzureEngine
    : K extends PROVIDERS.deepl
    ? DeeplEngine
    : K extends PROVIDERS.baidu
    ? BaiduEngine
    : K extends PROVIDERS.aliyun
    ? AliyunEngine
    : K extends PROVIDERS.tencent
    ? TencentEngine
    : K extends PROVIDERS.huawei
    ? HuaweiEngine
    : K extends PROVIDERS.youdao
    ? YoudaoEngine
    : never;
};

function getEmojiFlag(lang: string) {
  const key = lang !== 'auto' ? lang.split(/[-_]/gi).pop() : '';
  return emoji.emojify(
    emoji.get(`flag-${key?.toLowerCase()}`) || 'triangular_flag_on_post'
  );
}

const defaults: Options = {
  engines: [PROVIDERS.google, PROVIDERS.azure, PROVIDERS.tencent],
  policy: POLICIES.alternate,
  engineConfigs: {},
};
export class Translator {
  engines: Engines = {};
  currentEngine = 0;
  options: Options;
  constructor(options: Options) {
    this.options = Object.assign({}, defaults, options);
  }

  init(options?: Options) {
    if (options) {
      this.options = Object.assign({}, this.options, options);
    }

    const configs = this.options.engineConfigs;
    this.options.engines.forEach((engine) => {
      switch (engine) {
        case PROVIDERS.google:
          this.engines[engine] = new GoogleEngine(configs[engine]!);
          break;

        case PROVIDERS.azure:
          this.engines[engine] = new AzureEngine(configs[engine]!);
          break;

        case PROVIDERS.deepl:
          this.engines[engine] = new DeeplEngine(configs[engine]!);
          break;

        case PROVIDERS.baidu:
          this.engines[engine] = new BaiduEngine(configs[engine]!);
          break;

        case PROVIDERS.aliyun:
          this.engines[engine] = new AliyunEngine(configs[engine]!);
          break;

        case PROVIDERS.tencent:
          this.engines[engine] = new TencentEngine(configs[engine]!);
          break;

        case PROVIDERS.huawei:
          this.engines[engine] = new HuaweiEngine(configs[engine]!);
          break;

        case PROVIDERS.youdao:
          this.engines[engine] = new YoudaoEngine(configs[engine]!);
          break;
      }
    });
  }

  #getEngineByPolicy() {
    const { policy } = this.options;
    if (policy === POLICIES.randomized) {
      const total = Object.keys(this.options.engines).length;
      const point = Math.floor(Math.random() * total);
      return this.engines[this.options.engines[point]];
    } else if (policy === POLICIES.alternate) {
      const engineName = this.options.engines[this.currentEngine];
      if (this.currentEngine < this.options.engines.length - 1) {
        this.currentEngine += 1;
      } else {
        this.currentEngine = 0;
      }
      return this.engines[engineName];
    }
  }

  async translateByEngine(
    engineName: PROVIDERS,
    text: string,
    target: string,
    source = 'auto'
  ) {
    const engine = this.engines[engineName];
    const transilation = (await engine?.translate(text, target, source)) || '';

    console.log(
      '🚀 ',
      chalk.cyan(chalk.bold(engineName)),
      chalk.gray('['),
      getEmojiFlag(source),
      chalk.cyan(chalk.bold(source || 'detect')),
      chalk.gray('->'),
      getEmojiFlag(target),
      chalk.cyan(chalk.bold(target)),
      chalk.gray(']'),
      chalk.gray('transilation: '),
      chalk.green(chalk.bold(transilation))
    );
    return transilation;
  }

  async translate(text: string, target: string, source = 'auto') {
    const engine = this.#getEngineByPolicy();
    const transilation = (await engine?.translate(text, target, source)) || '';
    console.log(
      '🚀 ',
      chalk.cyan(chalk.bold(engine?.name)),
      chalk.gray('['),
      getEmojiFlag(source),
      chalk.cyan(chalk.bold(source || 'detect')),
      chalk.gray('->'),
      `${getEmojiFlag(target)}`,
      chalk.cyan(chalk.bold(target)),
      chalk.gray(']'),
      chalk.gray('transilation: '),
      chalk.green(chalk.bold(transilation))
    );
    return transilation;
  }
}
