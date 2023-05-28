import { ref } from 'vue';
import ColumnTools from './ColumnTools.vue';

export default function () {
  const visible = ref(false);
  return { visible, ColumnTools };
}
