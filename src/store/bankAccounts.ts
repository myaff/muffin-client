import { BankAccount, BankAccountCreate, BankAccountUpdate } from "@/models/bankAccount.model";
import { BankAccountService } from "@/services/bankAccount.service";
import { defineStore } from "pinia";
import { useUserStore } from "./user";
import { onMounted, watch } from "vue";
import useListStore, { ListStore } from "@/composables/useListStore";
import useEntityStore, { EntityStore } from "@/composables/useEntityStore";
import { useTransactionsStore } from "./transactions";

type BankAccountStore = ListStore<BankAccount> & EntityStore<BankAccount, BankAccountCreate, BankAccountUpdate>;
export const useBankAccountsStore = defineStore('bankAccounts', (): BankAccountStore => {
  const service = new BankAccountService();
  const userStore = useUserStore();
  const {
    list,
    isLoading,
    fetchList,
    page,
    pageSize,
    pagesCount,
    totalCount,
    hasPrev,
    hasNext,
    paginationQuery,
    setPage,
  } = useListStore<BankAccount>(service);
  const {
    detailsMap,
    getDetail,
    create,
    update,
    remove,
  } = useEntityStore<BankAccount, BankAccountCreate, BankAccountUpdate>(service, fetchList);

  watch(() => userStore.accessToken, value => {
    if (!value) {
      list.value = [];
      detailsMap.value.clear();
    }
  })

  watch(list, value => {
    value.forEach(item => {
      const details = detailsMap.value.get(item.id);
      if (details && details.balance !== item.balance) {
        details.balance = item.balance;
      }
    })
  })

  onMounted(() => {
    if (!list.value.length && !isLoading.value) fetchList();
  })

  const transactionsStore = useTransactionsStore();
  transactionsStore.$onAction(({ after }) => {
    after(() => fetchList());
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
    page,
    pageSize,
    pagesCount,
    totalCount,
    hasPrev,
    hasNext,
    paginationQuery,
    setPage,
  };
})