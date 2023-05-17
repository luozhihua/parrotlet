import { Ref, ref } from 'vue';
import QTableFilter from './QTableFilter.vue';
import QTableKeyword from './QTableKeyword.vue';

export interface Options {
  /**
   * @default false
   */
  caseSensitive?: boolean;
}

export default function useTableFilter(options: Options = {}) {
  const caseSensitive = ref(options.caseSensitive ?? false);
  const filterVisible = ref(false);
  const keyword = ref('');
  const filter = ref<Record<string, any>>({});

  function filterMethod(
    rows: readonly any[],
    _terms: any,
    _cols: readonly any[],
    _getCellValue: (col: any, row: any) => any
  ) {
    const conditions = filter.value;
    return rows.filter((row, i) => {
      const keywordMatched =
        !keyword.value ||
        Object.keys(row).some((k) => {
          return caseSensitive?.value === true
            ? row[k].includes(keyword.value)
            : row[k]?.toLowerCase()?.includes(keyword.value?.toLowerCase());
        });
      const ck = Object.keys(conditions);
      const validates = ck.filter((k) => {
        return caseSensitive?.value === true
          ? row[k]?.includes(conditions[k])
          : row[k]?.toLowerCase()?.includes(conditions[k]?.toLowerCase());
      });
      return keywordMatched && validates.length === ck.length;
    });
  }

  return {
    QTableFilter,
    QTableKeyword,
    keyword,
    caseSensitive,
    filterVisible,
    filter,
    filterMethod,
  };
}
