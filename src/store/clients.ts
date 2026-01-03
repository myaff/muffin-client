import { Client, ClientCreate, ClientUpdate } from "@/models/clients.model";
import { ClientsService } from "@/services/clients.service";
import { defineStore } from "pinia";
import { onMounted, ref, watch, reactive } from "vue";
import { useUserStore } from "./user";

export const useClientsStore = defineStore('clients', () => {
  const service = new ClientsService();
  const list = ref<Client[]>([]);
  const isLoading = ref(false);
  const detailsMap = reactive<Map<Client['id'], Client>>(new Map());
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
    return service.findOne(id).then(data => {
      if (data) detailsMap.set(id, data);
      return data;
    });
  }

  function getDetail(id: Client['id']) {
    if (detailsMap.has(id)) {
      return Promise
        .resolve(detailsMap.get(id) as Client)
        .then(() => fetchDetail(id));
    }
    return fetchDetail(id);
  }

  function create(formData: ClientCreate) {
    return service.create(formData)
      .then(data => {
        fetchList();
        return data;
      });
  }

  function update(id: number, formData: ClientUpdate) {
    return service.update(id, formData)
      .then(data => {
        if (data) detailsMap.set(id, data);
        return data;
      });
  }

  return {
    list,
    isLoading,
    fetchList,
    fetchDetail,
    detailsMap,
    getDetail,
    create,
    update,
  };
});