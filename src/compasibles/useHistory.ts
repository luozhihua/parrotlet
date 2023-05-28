import { useManualRefHistory } from '@vueuse/core';
import { deflate, inflate } from 'pako';
import { Ref, onUnmounted } from 'vue';

export default function useHistory(value: Ref<any>) {
  const history = useManualRefHistory(value, {
    clone: true,
    dump: (a) => deflate(JSON.stringify(a)),
    parse: (a) => JSON.parse(inflate(a, { to: 'string' })),
  });

  onUnmounted(() => {
    history.clear();
  });

  return {
    ...history,
  };
}
