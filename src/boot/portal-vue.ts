import { boot } from 'quasar/wrappers';
import PortalVue from 'portal-vue';

export default boot(({ app }) => {
  app.use(PortalVue);
});
