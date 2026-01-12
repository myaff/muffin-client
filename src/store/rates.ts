import { RatePlanFull, RatePlan, RateVersion, RatePlanCreate, RatePlanUpdate, RateScope } from "@/models/rates.model";
import { RatesService } from "@/services/rates.service";
import { defineStore } from "pinia";
import { onMounted, ref, watch, computed } from "vue";
import { useUserStore } from "./user";
import { Currency } from "@/models/currency.model";
import { Client } from "@/models/clients.model";
import { Project } from "@/models/projects.model";

export const useRatesStore = defineStore('rates', () => {
  const service = new RatesService();
  const isLoading = ref(false);
  const plans = ref<Map<RatePlan['id'], RatePlanFull>>(new Map());
  const versions = ref<Map<RateVersion['id'], RateVersion>>(new Map());
  const list = computed(() => Array.from(plans.value.values()));
  const ratesByCurrency = computed(() => {
    return list.value.reduce((acc, plan) => {
      if (!acc.has(plan.currency.id)) acc.set(plan.currency.id, []);
      acc.get(plan.currency.id)?.push(plan);
      return acc;
    }, new Map<Currency['id'], RatePlanFull[]>())
  });
  const ratesByClient = computed(() => {
    return list.value.reduce((acc, plan) => {
      if (!plan?.client?.id) return acc;
      acc.set(plan.client.id, plan);
      return acc;
    }, new Map<Client['id'], RatePlanFull>());
  });
  const ratesByProject = computed(() => {
    return list.value.reduce((acc, plan) => {
      if (!plan?.project?.id) return acc;
      acc.set(plan.project.id, plan);
      return acc;
    }, new Map<Project['id'], RatePlanFull>());
  });
  const userStore = useUserStore();

  watch(() => userStore.accessToken, value => {
    if (!value) {
      plans.value.clear();
      versions.value.clear();
    }
  })

  onMounted(() => {
    if (!list.value.length && !isLoading.value) fetchList();
  })

  function fetchList() {
    isLoading.value = true;
    return service.findAll()
      .then(data => {
        if (data?.list) setPlans(data.list);
      })
      .finally(() => isLoading.value = false);
  }

  function setPlans(collection: RatePlanFull[]) {
    collection.forEach(plan => {
      plans.value.set(plan.id, plan);
      const ratePlan = { ...plan, versions: undefined };
      const rateVersions = plan.versions.map(version => ({
        ...version,
        ratePlan,
      }))
      setVersions(rateVersions);
    });
  }

  function setVersions(collection: RateVersion[]) {
    collection.forEach(version => {
      versions.value.set(version.id, version);
    });
  }

  function fetchDetail(id: number) {
    return service.findOne(id).then(data => {
      if (data) setPlans([data]);
    });
  }

  function create(formData: RatePlanCreate) {
    return service.create(formData)
      .then(data => {
        fetchList();
        return data;
      });
  }

  function update(id: number, formData: RatePlanUpdate) {
    return service.update(id, formData).then(fetchList);
  }

  function getRateForUser(currency: Pick<Currency, 'id'>) {
    return ratesByCurrency.value
      .get(currency.id)
      ?.find(plan => plan.scope === RateScope.USER && plan.active)
      ?? null;
  }

  function getRateForClient(client: Pick<Client, 'id' | 'country'>) {
    return ratesByClient.value.get(client.id)
      ?? getRateForUser(client.country.currency);
  }

  function getRateForProject(project: Pick<Project, 'id' | 'client'>) {
    return ratesByProject.value.get(project.id)
      ?? getRateForClient(project.client);
  }

  return {
    service,
    list,
    plans,
    versions,
    fetchList,
    fetchDetail,
    create,
    update,
    getRateForUser,
    getRateForClient,
    getRateForProject,
  };
});