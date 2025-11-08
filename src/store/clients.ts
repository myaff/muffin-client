import { Client, ClientCreate, ClientUpdate } from "@/models/clients.model";
import { ClientsService } from "@/services/clients.service";
import { defineStore } from "pinia";
import { onMounted, ref, watch } from "vue";
import { useUserStore } from "./user";

export const useClientsStore = defineStore('clients', () => {
  const service = new ClientsService();
  const list = ref<Client[]>([]);
  const isLoading = ref(false);
  const userStore = useUserStore();

  watch(() => userStore.accessToken, value => {
    if (!value) list.value = [];
  })

  onMounted(() => {
    if (!list.value.length && !isLoading.value) fetchList();
  })

  function fetchList() {
    isLoading.value = true;
    return service.findAll()
      .then(data => {
        if (data.length) list.value = data;
      })
      .finally(() => isLoading.value = false);
  }

  function fetchDetail(id: number) {
    return service.findOne(id);
  }

  function create(formData: ClientCreate) {
    return service.create(formData)
      .then(data => {
        fetchList();
        return data;
      });
  }

  function update(id: number, formData: ClientUpdate) {
    return service.update(id, formData).then(fetchList);
  }

  return { list, isLoading, fetchList, fetchDetail, create, update };
});