// const remote = require('@electron/remote/main');

const electron = require('electron');
const remote =
  process.type === 'browser'
    ? electron
    : require('@electron/remote/dist/src/renderer/remote');

export function setEnv(key: string, value: string) {
  try {
    const PROC: NodeJS.Process = process;
    const ENV_KEY: 'env' = ['e', 'n', 'v'].join('') as 'env';
    const ENV = PROC?.[ENV_KEY];
    ENV && (ENV[key] = value);

    if (remote) {
      process[ENV_KEY][key] = value;
    }
  } catch (e) {
    console.error('22', e);
  }
}

export function getEnv(key: string) {
  const PROC: NodeJS.Process = remote.process;
  const ENV_KEY: 'env' = ['e', 'n', 'v'].join('') as 'env';
  const ENV = PROC[ENV_KEY];
  return ENV[key];
}

export function updateGoogleAppCredentials(path: string) {
  if (path) {
    remote.process.env.GOOGLE_APPLICATION_CREDENTIALS = path;
  }
}
