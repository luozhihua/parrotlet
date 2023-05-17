/**
 * npm i lrz
 */
declare module 'lrz' {
  interface Options {
    width?: number;
    height?: number;
    quality?: number;
    fieldName?: string;
  }

  interface Result {
    formData: FormData;
    file: File;
    fileLen: number;
    base64: string;
    base64Len: number;
    origin: File;
  }

  interface PromiseLike<T> {
    then: (cb: (result: Result) => any) => PromiseLike<T>;
    catch: (cb: (err: any) => any) => PromiseLike<T>;
    always: (cb: (...args: any[]) => any) => PromiseLike<T>;
  }

  export default function lrz(
    file: File,
    options?: Options
  ): PromiseLike<Result>;
}

/**
 * npm i short-unique-id
 */
declare module 'short-unique-id' {
  export default class ShortUniqueId {
    public randomUUID(length: number): string;
    public sequentialUUID(): string;
  }
}

/**
 * npm i short-unique-id
 */
declare module 'vue-pouch-db' {
  interface VPD {
    install: any;
    [key: string]: any;
  }
  const mod: VPD;
  export default mod;
}
