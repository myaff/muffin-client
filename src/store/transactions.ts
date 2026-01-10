import { defineStore } from "pinia";
import { useUserStore } from "./user";
import {watch } from "vue";
import useListStore from "@/composables/useListStore";
import useEntityStore from "@/composables/useEntityStore";
import { TransactionService } from "@/services/transactions.service";
import { Transaction, TransactionCreate, TransactionUpdate } from "@/models/transaction.model";

export const useTransactionsStore = defineStore('transactions', () => {
  const service = new TransactionService();
  const userStore = useUserStore();
  const { list, isLoading, fetchList } = useListStore<Transaction>(service);
  const {
    detailsMap,
    getDetail,
    create,
    update,
    remove,
  } = useEntityStore<Transaction, TransactionCreate, TransactionUpdate>(service, fetchList);

  watch(() => userStore.accessToken, value => {
    if (!value) {
      list.value = [];
      detailsMap.value.clear();
    }
  })

  return {
    service,
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