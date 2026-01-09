import { Paginatable } from "@/models/common.model";
import { computed, ref } from "vue";

export interface UsePaginationConfig {
  page: number;
  pageSize: number;
}
export default function usePagination(config: Partial<UsePaginationConfig>) {
  const DEFAULT_CONFIG = { page: 1, pageSize: 10 };
  const page = ref(config?.page ?? DEFAULT_CONFIG.page)
  const pageSize = ref(config?.pageSize ?? DEFAULT_CONFIG.pageSize);
  const pagesCount = ref(1);
  const totalCount = ref(0);
  const hasNext = ref(false);
  const hasPrev = ref(false);

  const paginationQuery = computed(() => ({
    page: page.value,
    pageSize: pageSize.value,
  }))

  function setPagination(data: Paginatable) {
    page.value = data.page;
    pageSize.value = data.pageSize;
    pagesCount.value = data.pagesCount;
    totalCount.value = data.totalCount;
    hasNext.value = data.hasNext;
    hasPrev.value = data.hasPrev;
  }

  function setPage(value: number) {
    page.value = value;
  }

  return {
    page,
    pageSize,
    pagesCount,
    totalCount,
    hasPrev,
    hasNext,
    paginationQuery,
    setPagination,
    setPage,
  };
}