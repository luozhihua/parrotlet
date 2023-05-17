import { boot } from 'quasar/wrappers';
import { electron } from '../util/electron';
import { useTranslateStore } from '../stores/useTranslateStore';

export default boot(async () => {
  const store = useTranslateStore();
  const options = store.$state;

  await new Promise((resolve) => setTimeout(resolve, 1000));
  await electron.initTranslator(JSON.stringify(options));
});
