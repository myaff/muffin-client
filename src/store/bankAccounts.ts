import { BankAccount, BankAccountCreate, BankAccountUpdate } from "@/models/bankAccount.model";
import { BankAccountService } from "@/services/bankAccount.service";
import { defineStore } from "pinia";
import { useUserStore } from "./user";
import { onMounted, watch } from "vue";
import useListStore from "@/composables/useListStore";
import useEntityStore from "@/composables/useEntityStore";

export const useBankAccountsStore = defineStore('bankAccounts', () => {
  const service = new BankAccountService();
  const userStore = useUserStore();
  const { list, isLoading, fetchList } = useListStore<BankAccount>(service);
  const {
    detailsMap,
    getDetail,
    create,
    update,
  } = useEntityStore<BankAccount, BankAccountCreate, BankAccountUpdate>(service, fetchList);

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
  };
})