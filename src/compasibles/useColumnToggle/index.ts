import { Ref, ref } from 'vue';
import ColumnToggle from './ColumnToggle.vue';

const visibleColumns = ref<string[]>([]);
export default function (columns?: Ref<any>) {
  if (columns?.value?.length) {
    visibleColumns.value = columns.value.map((col: any) => col._key);
  }

  function hideColumn(col: string) {
    const index = visibleColumns.value.indexOf(col);
    visibleColumns.value.splice(index, 1);
  }

  function showColumn(col: string) {
    const index = visibleColumns.value.indexOf(col);
    if (index === -1) {
      visibleColumns.value.push(col);
    }
  }

  function toggleColumn(col: string) {
    const index = visibleColumns.value.indexOf(col);
    if (index === -1) {
      visibleColumns.value.push(col);
    } else {
      visibleColumns.value.splice(index, 1);
    }
  }

  return { ColumnToggle, visibleColumns, hideColumn, showColumn, toggleColumn };
}
