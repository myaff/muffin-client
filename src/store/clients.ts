import { Client, ClientCreate, ClientUpdate } from "@/models/clients.model";
import { ClientsService } from "@/services/clients.service";
import { defineStore } from "pinia";
import { onMounted, watch } from "vue";
import { useUserStore } from "./user";
import useListStore from "@/composables/useListStore";
import useEntityStore from "@/composables/useEntityStore";

export const useClientsStore = defineStore('clients', () => {
  const service = new ClientsService();
  const { list, isLoading, fetchList } = useListStore<Client>(service);
  const {
    detailsMap,
    getDetail,
    create,
    update,
  } = useEntityStore<Client, ClientCreate, ClientUpdate>(service, fetchList);
  const userStore = useUserStore();

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
});