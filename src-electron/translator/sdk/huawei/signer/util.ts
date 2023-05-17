import crypto, { BinaryLike } from 'crypto';
import { Algorithm, HeaderContentSha256 } from './constant';
import Request from './request-option';

const hexTable = new Array(256);
for (let i = 0; i < 256; ++i)
  hexTable[i] = '%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase();

const noEscape = [
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0, // 0 - 15
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0, // 16 - 31
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  0, // 32 - 47
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  0,
  0,
  0,
  0, // 48 - 63
  0,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1, // 64 - 79
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  0,
  0,
  1, // 80 - 95
  0,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1, // 96 - 111
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  0,
  1,
  0, // 112 - 127
];

export function hmacsha256(keyByte: BinaryLike, message: BinaryLike) {
  return crypto
    .createHmac('SHA256', keyByte)
    .update(message)
    .digest()
    .toString('hex');
}

export function HexEncodeSHA256Hash(body: BinaryLike) {
  return crypto.createHash('SHA256').update(body).digest().toString('hex');
}

// function urlEncode is based on https://github.com/nodejs/node/blob/master/lib/querystring.js
// Copyright Joyent, Inc. and other Node contributors.
export function urlEncode(str: string | Record<string, any>) {
  if (typeof str !== 'string') {
    if (typeof str === 'object') str = String(str);
    else (str as string) += '';
  }
  let out = '';
  let lastPos = 0;

  for (let i = 0; i < str.length; ++i) {
    let c = str.charCodeAt(i);

    // ASCII
    if (c < 0x80) {
      if (noEscape[c] === 1) continue;
      if (lastPos < i) out += str.slice(lastPos, i);
      lastPos = i + 1;
      out += hexTable[c];
      continue;
    }

    if (lastPos < i) out += str.slice(lastPos, i);

    // Multi-byte characters ...
    if (c < 0x800) {
      lastPos = i + 1;
      out += hexTable[0xc0 | (c >> 6)] + hexTable[0x80 | (c & 0x3f)];
      continue;
    }
    if (c < 0xd800 || c >= 0xe000) {
      lastPos = i + 1;
      out +=
        hexTable[0xe0 | (c >> 12)] +
        hexTable[0x80 | ((c >> 6) & 0x3f)] +
        hexTable[0x80 | (c & 0x3f)];
      continue;
    }
    // Surrogate pair
    ++i;

    if (i >= str.length) throw new Error('ERR_INVALID_URI');

    const c2 = str.charCodeAt(i) & 0x3ff;

    lastPos = i + 1;
    c = 0x10000 + (((c & 0x3ff) << 10) | c2);
    out +=
      hexTable[0xf0 | (c >> 18)] +
      hexTable[0x80 | ((c >> 12) & 0x3f)] +
      hexTable[0x80 | ((c >> 6) & 0x3f)] +
      hexTable[0x80 | (c & 0x3f)];
  }
  if (lastPos === 0) return str;
  if (lastPos < str.length) return out + str.slice(lastPos);
  return out;
}

export function findHeader(r: Request, header: string) {
  for (const k in r.headers) {
    if (k.toLowerCase() === header.toLowerCase()) {
      return r.headers[k];
    }
  }
  return null;
}

// Build a CanonicalRequest from a regular request string
//
// CanonicalRequest =
//  HTTPRequestMethod + '\n' +
//  CanonicalURI + '\n' +
//  CanonicalQueryString + '\n' +
//  CanonicalHeaders + '\n' +
//  SignedHeaders + '\n' +
//  HexEncode(Hash(RequestPayload))
export function CanonicalRequest(r: Request, signedHeaders: any) {
  let hexencode = findHeader(r, HeaderContentSha256);
  if (hexencode === null) {
    const data = RequestPayload(r as Request);
    hexencode = HexEncodeSHA256Hash(data);
  }
  return (
    r.method +
    '\n' +
    CanonicalURI(r) +
    '\n' +
    CanonicalQueryString(r) +
    '\n' +
    CanonicalHeaders(r, signedHeaders) +
    '\n' +
    signedHeaders.join(';') +
    '\n' +
    hexencode
  );
}

function CanonicalURI(r: Request) {
  const pattens = r.uri.split('/');
  const uri = [];
  for (const k in pattens) {
    const v = pattens[k];
    uri.push(urlEncode(v));
  }
  let urlpath = uri.join('/');
  if (urlpath[urlpath.length - 1] !== '/') {
    urlpath = urlpath + '/';
  }
  //r.uri = urlpath
  return urlpath;
}

export function CanonicalQueryString(r: Request) {
  const keys = [];
  for (const key in r.query) {
    keys.push(key);
  }
  keys.sort();
  const a = [];
  for (const i in keys) {
    const key = urlEncode(keys[i]);
    const value = r.query[keys[i]];
    if (Array.isArray(value)) {
      value.sort();
      for (const iv in value) {
        a.push(key + '=' + urlEncode(value[iv]));
      }
    } else {
      a.push(key + '=' + urlEncode(value));
    }
  }
  return a.join('&');
}

function CanonicalHeaders(r: Request, signedHeaders: Record<string, string>) {
  const headers: Record<string, string> = {};
  for (const key in r.headers) {
    headers[key.toLowerCase()] = r.headers[key];
  }
  const a = [];
  for (const i in signedHeaders) {
    const value = headers[signedHeaders[i]];
    a.push(signedHeaders[i] + ':' + value.trim());
  }
  return a.join('\n') + '\n';
}

export function SignedHeaders(r: Request) {
  const a = [];
  for (const key in r.headers) {
    a.push(key.toLowerCase());
  }
  a.sort();
  return a;
}

function RequestPayload(r: Request) {
  return r.body;
}

// Create a "String to Sign".
export function StringToSign(canonicalRequest: BinaryLike, t: string) {
  const bytes = HexEncodeSHA256Hash(canonicalRequest);
  return Algorithm + '\n' + t + '\n' + bytes;
}

// Create the HWS Signature.
export function SignStringToSign(
  stringToSign: BinaryLike,
  signingKey: BinaryLike
) {
  return hmacsha256(signingKey, stringToSign);
}

// Get the finalized value for the "Authorization" header.  The signature
// parameter is the output from SignStringToSign
export function AuthHeaderValue(
  signature: string,
  Key: string,
  signedHeaders: string[]
) {
  return (
    Algorithm +
    ' Access=' +
    Key +
    ', SignedHeaders=' +
    signedHeaders.join(';') +
    ', Signature=' +
    signature
  );
}

export function twoChar(s: number) {
  if (s >= 10) {
    return '' + s;
  } else {
    return '0' + s;
  }
}

export function getTime() {
  const date = new Date();
  return (
    '' +
    date.getUTCFullYear() +
    twoChar(date.getUTCMonth() + 1) +
    twoChar(date.getUTCDate()) +
    'T' +
    twoChar(date.getUTCHours()) +
    twoChar(date.getUTCMinutes()) +
    twoChar(date.getUTCSeconds()) +
    'Z'
  );
}
