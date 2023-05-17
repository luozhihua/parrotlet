import { createPersistedState } from 'pinia-plugin-persistedstate';
import { electron } from '../util/electron';

const persister = createPersistedState({
  key: (id: string) => `parrotlet-store-${id}`,
  storage: electron.storage,
  auto: true,
  debug: !!process.env.DEBUGGING,
});

export default persister;
