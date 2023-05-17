import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import storage from '../../../apis/storage';

export interface BaiduAccessToken {
  refrech_token: string;
  expires_in: number;
  session_key: string;
  access_token: string;
  scope: string;
}

function getCache(): string | null {
  return storage.get('translator.engineConfigs.baidu.accessToken') as string;
}

function isExpires(token: string) {
  const expires = parseInt(token.split('.')[3]);
  const now = Math.floor(Date.now() / 1000);
  return now > expires - 60;
}

/**
 * Request a new access token
 * @param apiKey
 * @param secretKey
 * @returns
 */
async function requestNewToken(apiKey: string, secretKey: string) {
  const grant_type = 'client_credentials';
  const client_id = apiKey;
  const client_secret = secretKey;
  const url = 'https://aip.baidubce.com/oauth/2.0/token';

  const options: AxiosRequestConfig = {
    url,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    params: {
      grant_type,
      client_id,
      client_secret,
    },
  };

  try {
    const response = await axios<any, AxiosResponse<BaiduAccessToken>>(options);
    return response.data.access_token;
  } catch (error: any) {
    throw new Error(error);
  }
}

export async function getAccessToken(
  apiKey: string,
  secretKey: string
): Promise<string> {
  const cache = getCache();
  if (cache && !isExpires(cache)) {
    return cache;
  } else {
    const token = await requestNewToken(apiKey, secretKey);
    storage.set('translator.engineConfigs.baidu.accessToken', token);
    return token;
  }
}
