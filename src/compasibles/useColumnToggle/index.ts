import { Ref, ref } from 'vue';
import ColumnToggle from './ColumnToggle.vue';

export default function (columns: Ref<any>) {
  const visibleColumns = ref<string[]>(
    columns.value.map((col: any) => col._key)
  );

  return { visibleColumns, ColumnToggle };
}
