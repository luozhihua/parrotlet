import { useManualRefHistory } from '@vueuse/core';
import { deflate, inflate } from 'pako';
import { Ref, onUnmounted } from 'vue';
import { timestamp } from '@vueuse/shared';

export default function useHistory(source: Ref<any>, compress = true) {
  const dump = (a: any) =>
    compress ? deflate(JSON.stringify(a)) : JSON.stringify(a);
  const parse = (a: any) =>
    compress ? JSON.parse(inflate(a, { to: 'string' })) : JSON.parse(a);
  const history = useManualRefHistory(source, {
    clone: true,
    dump,
    parse,
  });

  onUnmounted(() => {
    history.clear();
  });

  return {
    ...history,
    init() {
      history.last.value = {
        snapshot: dump(source.value),
        timestamp: timestamp(),
      };
    },
  };
}
