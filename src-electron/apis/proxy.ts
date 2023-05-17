import { type Session, type Config } from 'electron';
import { setEnv } from './env';
import storage from './storage';
import { session } from 'electron';

export function getBypass(bypass: string[] = []): string {
  const all = ['<local>', '*alicdn.com'].concat(bypass).filter((a) => !!a);
  return Array.from(new Set(all)).join(',');
}

export async function resolveProxy(_session?: Session) {
  const proxy = storage.get('setting.proxy') as Record<string, any>;
  const proxyRules = `${proxy.type}://${proxy[proxy.type]}`;
  const iSession = _session || session.defaultSession;
  const proxyBypassRules = getBypass(proxy.bypass);

  if (proxy?.enable) {
    const electronSessionProxyOpt: Config = {
      proxyRules,
      proxyBypassRules,
      pacScript: proxy.pac,
    };

    console.log(electronSessionProxyOpt.proxyBypassRules);

    if (proxy.type === 'pac') {
      setEnv('HTTP_PROXY', '');
      setEnv('HTTPS_PROXY', '');
      setEnv('http_proxy', '');
      setEnv('https_proxy', '');
    }

    if (['http', 'https'].includes(proxy.type)) {
      setEnv('HTTP_PROXY', proxyRules);
      setEnv('HTTPS_PROXY', proxyRules);
      setEnv('http_proxy', proxyRules);
      setEnv('https_proxy', proxyRules);
    }

    if (proxy.type === 'socks') {
      setEnv('ALL_PROXY', proxyRules);
      setEnv('all_proxy', proxyRules);
    }

    setEnv('NO_PROXY', proxyBypassRules);
    setEnv('no_proxy', proxyBypassRules);
    await iSession.setProxy(electronSessionProxyOpt);
  } else {
    setEnv('HTTP_PROXY', '');
    setEnv('HTTPS_PROXY', '');
    setEnv('ALL_PROXY', '');
    setEnv('http_proxy', '');
    setEnv('https_proxy', '');
    setEnv('all_proxy', '');
    await iSession?.setProxy({ proxyRules: '' });
  }
}
