import { RateDetail, RateCreate, RateUpdate } from "@/models/rates.model";
import { RatesService } from "@/services/rates.service";
import { defineStore } from "pinia";
import { onMounted, ref, watch } from "vue";
import { useUserStore } from "./user";

export const useRatesStore = defineStore('rates', () => {
  const service = new RatesService();
  const list = ref<RateDetail[]>([]);
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

  function create(formData: RateCreate) {
    return service.create(formData)
      .then(data => {
        fetchList();
        return data;
      });
  }

  function update(id: number, formData: RateUpdate) {
    return service.update(id, formData).then(fetchList);
  }

  return { list, fetchList, fetchDetail, create, update };
});