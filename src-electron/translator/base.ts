import pLimit from 'p-limit';
export interface EncodedText {
  text: string;
  variables: string[] | null;
}
export default abstract class TranslateBase<ConfT = Record<string, any>> {
  options: ConfT = {} as ConfT;
  variablesExp = /\{[^}]+\}/gi;
  multiple = false;
  supportedLocales: string[] | null = null;

  abstract name: string;
  abstract localeMaper?: Record<string, string>;

  static getContryCode(locale: string, ignores: string[] = []) {
    const ignore = ignores
      .map((a) => a.toLocaleLowerCase())
      .includes(locale.toLowerCase());
    const pice = locale.split(/[-_]/);
    return ignore ? locale : pice.length < 2 ? locale : pice.pop();
  }

  static getLangCode(locale: string, ignores: string[] = []) {
    const ignore = ignores
      .map((a) => a.toLocaleLowerCase())
      .includes(locale.toLowerCase());

    return ignore ? locale : (locale.split(/[-_]/).shift() as string);
  }

  constructor(options: ConfT) {
    this.options = options;
  }

  mapLocale(locale: string) {
    return this.localeMaper?.[locale];
  }

  encode(text: string): EncodedText {
    const placeholder = '#_# ';
    return {
      text: text?.replace(this.variablesExp, placeholder),
      variables: text?.match(this.variablesExp),
    };
  }

  decode(encodedText: EncodedText): string {
    const variables = encodedText.variables || [];
    return encodedText.text?.replace(
      /#\s*_\s*#/gi,
      () => variables.shift() || ''
    );
  }

  getTexts(params: EncodedText | EncodedText[]) {
    return Array.isArray(params) ? params.map((p) => p.text) : params.text;
  }

  getVariables(params: EncodedText | EncodedText[]) {
    return Array.isArray(params)
      ? params.map((p) => p.variables)
      : params.variables;
  }

  async batchRequest(text: string[], target: string, source?: string) {
    const limit = pLimit(6);
    return this.multiple
      ? this.request(text, target, source)
      : await Promise.all(
          text.map(async (t) => limit(() => this.request(t, target, source)))
        );
  }

  async translate<T = string>(
    text: T,
    target: string,
    source?: string
  ): Promise<T>;
  async translate<T = string[]>(
    text: T,
    target: string,
    source?: string
  ): Promise<T>;
  async translate<T extends string | string[]>(
    text: T,
    target: string,
    source = 'auto'
  ): Promise<T> {
    const encodedText = Array.isArray(text)
      ? text.map((t) => this.encode(t))
      : this.encode(text);
    const data = Array.isArray(encodedText)
      ? encodedText.map((t) => t.text)
      : encodedText.text || text;
    const engineResult = await (!Array.isArray(data) || this.multiple
      ? this.request(data, target, source)
      : this.batchRequest(data, target, source));

    return Array.isArray(engineResult)
      ? (engineResult.map((r, i) =>
          this.decode({
            text: r,
            variables: (encodedText as EncodedText[])[i].variables,
          })
        ) as T)
      : (this.decode({
          text: engineResult,
          variables: (encodedText as EncodedText).variables,
        }) as T);
  }

  abstract request<T = string>(
    text: T,
    target: string,
    source?: string
  ): Promise<T>;
  abstract request<T = string[]>(
    text: T,
    target: string,
    source?: string
  ): Promise<T>;
}
