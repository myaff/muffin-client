import useEntityStore from "@/composables/useEntityStore";
import useListStore from "@/composables/useListStore";
import { Invoice, InvoiceCreate, InvoiceUpdate } from "@/models/invoice.model";
import { InvoiceService } from "@/services/invoice.service";
import { defineStore } from "pinia";
import { useUserStore } from "./user";
import { watch } from "vue";

export const useInvoicesStore = defineStore('invoice', () => {
  const service = new InvoiceService();
  const userStore = useUserStore();
  const { list, isLoading, fetchList } = useListStore<Invoice>(service);
  const {
    detailsMap,
    getDetail,
    create,
    update,
  } = useEntityStore<Invoice, InvoiceCreate, InvoiceUpdate>(service, fetchList);

  watch(() => userStore.accessToken, value => {
    if (!value) {
      list.value = [];
      detailsMap.value.clear();
    }
  })

  function remove(id: string | number) {
    return service.delete(id);
  }

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