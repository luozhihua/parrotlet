export default class RequestOption<BodyT extends string = string> {
  method: string;
  host: string;
  uri: string;
  query: Record<string, string[]>;
  headers: Record<string, string>;
  body: BodyT;

  constructor(
    method: string,
    url: string,
    headers: Record<string, string> = {},
    body = ''
  ) {
    if (method === undefined) {
      this.method = '';
    } else {
      this.method = method;
    }
    if (url === undefined) {
      this.host = '';
      this.uri = '';
      this.query = {};
    } else {
      this.query = {};
      let host, path, i;

      i = url.indexOf('://');
      if (i !== -1) {
        url = url.substr(i + 3);
      }

      i = url.indexOf('?');
      if (i !== -1) {
        const query_str = url.substr(i + 1);
        url = url.substr(0, i);
        const spl = query_str.split('&');
        for (const i in spl) {
          const kv = spl[i];
          const index = kv.indexOf('=');
          let key, value;
          if (index >= 0) {
            key = kv.substr(0, index);
            value = kv.substr(index + 1);
          } else {
            key = kv;
            value = '';
          }
          if (key !== '') {
            key = decodeURI(key);
            value = decodeURI(value);
            if (this.query[key] === undefined) {
              this.query[key] = [value];
            } else {
              this.query[key].push(value);
            }
          }
        }
      }

      i = url.indexOf('/');
      if (i === -1) {
        host = url;
        path = '/';
      } else {
        host = url.substr(0, i);
        path = url.substr(i);
      }
      this.host = host;
      this.uri = decodeURI(path);
    }

    this.headers = headers;
    this.body = body as any;
  }
}
