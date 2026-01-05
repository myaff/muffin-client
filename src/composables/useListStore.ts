import { BaseContentEntity, FetchListParams } from "@/models/common.model";
import { ListService } from "@/models/service.model";
import { ref } from "vue";

export default function useListStore<T extends BaseContentEntity>(service: ListService<T>) {

  const list = ref<T[]>([]);
  const isLoading = ref(false);

  function fetchList(params?: FetchListParams) {
    isLoading.value = true;
    return service.findAll(params)
      .then(data => {
        if (data.length) list.value = data;
      })
      .finally(() => isLoading.value = false);
  }

  return {
    list,
    isLoading,
    fetchList,
  }
}