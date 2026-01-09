import { defineStore } from "pinia";
import { useUserStore } from "./user";
import { onMounted, watch } from "vue";
import useListStore from "@/composables/useListStore";
import useEntityStore from "@/composables/useEntityStore";
import { TransactionCategory, TransactionCategoryCreate, TransactionCategoryUpdate } from "@/models/transaction.model";
import { TransactionCategoryService } from "@/services/transactionCategories.service";

export const useTransactionsCategorieStore = defineStore('transactionCategories', () => {
  const service = new TransactionCategoryService();
  const userStore = useUserStore();
  const { list, isLoading, fetchList } = useListStore<TransactionCategory>(service);
  const {
    detailsMap,
    getDetail,
    create,
    update,
    remove,
  } = useEntityStore<TransactionCategory, TransactionCategoryCreate, TransactionCategoryUpdate>(service, fetchList);

  watch(() => userStore.accessToken, value => {
    if (!value) {
      list.value = [];
      detailsMap.value.clear();
    }
  })

  onMounted(() => {
    if (!list.value.length && !isLoading.value) fetchList();
  })

  return {
    list,
    isLoading,
    fetchList,
    detailsMap,
    getDetail,
    create,
    update,
    remove,
  };
})