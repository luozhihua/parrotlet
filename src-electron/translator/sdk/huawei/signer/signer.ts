import Request from './request-option';
import * as util from './util';
import { HeaderXDate, HeaderAuthorization } from './constant';

export default class Signer {
  Key = '';
  Secret = '';

  constructor(key: string, secret: string) {
    this.Key = key;
    this.Secret = secret;
  }

  Sign(r: Request) {
    let headerTime = util.findHeader(r, HeaderXDate);
    if (headerTime === null) {
      headerTime = util.getTime();
      r.headers[HeaderXDate] = headerTime;
    }
    if (r.method !== 'PUT' && r.method !== 'PATCH' && r.method !== 'POST') {
      r.body = '';
    }
    let queryString = util.CanonicalQueryString(r);
    if (queryString !== '') {
      queryString = '?' + queryString;
    }
    const options = {
      hostname: r.host,
      path: encodeURI(r.uri) + queryString,
      method: r.method,
      headers: r.headers,
    };
    if (util.findHeader(r, 'host') === null) {
      r.headers.host = r.host;
    }
    const signedHeaders = util.SignedHeaders(r);
    const canonicalRequest = util.CanonicalRequest(r, signedHeaders);
    const stringToSign = util.StringToSign(canonicalRequest, headerTime);
    const signature = util.SignStringToSign(stringToSign, this.Secret);
    options.headers[HeaderAuthorization] = util.AuthHeaderValue(
      signature,
      this.Key,
      signedHeaders
    );
    return options;
  }
}
