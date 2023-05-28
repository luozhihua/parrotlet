// import { MSG } from './protocol.cjs';

const missing = new Map();
const sended = new Map();
async function send() {
  const id = ['rid', Date.now(), Math.floor(Math.random() * 10000)].join('-');
  const texts = Object.fromEntries(missing.entries());
  console.log('=============================================', texts);
  if (Object.keys(texts).length > 0) {
    import.meta.hot?.send('i18n-text:missing', { id, texts });
    Object.entries(texts).forEach(([m, l]) => {
      sended.set(m, l);
      missing.delete(m);
    });
  }
}

setInterval(send, 5000);

const _warn = console.warn;
console.warn = function (...args) {
  if (args[0].startsWith('[intlify]')) {
    // debugger
    const a = args[0].match(/\[intlify\][\w\s]+'([^']+)' key in '([^']+)'/);
    if (a && a?.[2].replace(/[-_]/g, '-').toLowerCase() === 'en-us') {
      if (!sended.has(a[1])) {
        missing.set(a[1], a[2]);
      }
      // import.meta.hot?.send('i18n-text:missing', { key: a?.[1], lang: a?.[2] });
    } else {
      console.log(args[0], 'xxxxxxxxxxxxxxxxxxxxxx', a);
    }
  } else {
    // _warn.apply(console, args)
  }
};
