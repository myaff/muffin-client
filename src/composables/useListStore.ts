import { BaseContentEntity, FetchListParams, PaginationParams } from "@/models/common.model";
import { ListService } from "@/models/service.model";
import { ref } from "vue";
import usePagination from "./usePagination";

export default function useListStore<T extends BaseContentEntity>(service: ListService<T>, paginationParams: PaginationParams = { page: 1, pageSize: 10 }) {

  const list = ref<T[]>([]);
  const isLoading = ref(false);
  const {
    page,
    pageSize,
    pagesCount,
    totalCount,
    hasPrev,
    hasNext,
    paginationQuery,
    setPagination,
    setPage,
  } = usePagination(paginationParams);

  function fetchList(params?: FetchListParams) {
    isLoading.value = true;
    return service.findAll(params)
      .then(data => {
        if (data) setPagination(data);
        if (data?.list) list.value = data.list || [];
      })
      .finally(() => isLoading.value = false);
  }

  return {
    list,
    isLoading,
    fetchList,
    page,
    pageSize,
    pagesCount,
    totalCount,
    paginationQuery,
    hasPrev,
    hasNext,
    setPage,
  }
}

export type ListStore<T extends BaseContentEntity> = ReturnType<typeof useListStore<T>>