import { FetchListParams } from "@/models/common.model";
import { Tracking, TrackingCreate, TrackingFilter, TrackingUpdate } from "@/models/tracking.model";
import { TrackingService } from "@/services/tracking.service";
import { endOfMonth, formatISO, startOfMonth } from "date-fns";
import { defineStore } from "pinia";
import { computed, reactive, ref, watch } from "vue";
import { useUserStore } from "./user";

interface TrackingDay {
  date: Date;
  total: number;
  tracking: Tracking[];
}

export const useTrackingStore = defineStore('tracking', () => {
  const service = new TrackingService();
  const list = ref<Tracking[]>([]);
  const isLoading = ref(false);
  const calendar = computed(() => {
    return list.value.reduce((acc, item) => {
      const date = new Date(item.date);
      if (acc.has(date)) {
        const accItem = acc.get(date) as TrackingDay;
        accItem.total += item.amount;
        accItem.tracking.push(item);
      } else {
        acc.set(date, { date, total: item.amount, tracking: [item] });
      }
      return acc;
    }, new Map<Date, TrackingDay>());
  })
  const filter = reactive<TrackingFilter>({
    dateFrom: startOfMonth(new Date()),
    dateTo: endOfMonth(new Date()),
    project: [] as number[],
    client: null,
  });
  const userStore = useUserStore();

  watch(() => userStore.accessToken, value => {
    if (!value) list.value = [];
  })

  const setFilter = (data: Partial<TrackingFilter>) => {
    if (data.dateFrom) filter.dateFrom = data.dateFrom;
    if (data.dateTo) filter.dateTo = data.dateTo;
    if ('project' in data) filter.project = data.project;
    if ('client' in data) filter.client = data.client;
  }

  const fetchList = (filterData?: Partial<TrackingFilter>) => {
    const transformedFilter: FetchListParams = {
      dateFrom: formatISO(filterData?.dateFrom || filter.dateFrom),
      dateTo: formatISO(filterData?.dateTo || filter.dateTo),
    }
    if (filterData?.project?.length || filter.project?.length) {
      transformedFilter.project = filterData?.project || filter.project;
    }
    if (filterData?.client || filter.client) {
      transformedFilter.client = (filterData?.client || filter.client) as number;
    }
    isLoading.value = true;
    return service.findAll(transformedFilter)
      .then(data => {
        list.value = data;
      })
      .finally(() => isLoading.value = false);
  }

  const fetchDetail = (id: number) => {
    return service.findOne(id);
  }

  const create = (formData: TrackingCreate | TrackingCreate[], needRefetch = true) => {
    return service.create(formData)
      .then(data => {
        if (needRefetch) fetchList();
        return data;
      });
  }

  const update = (formData: TrackingUpdate | TrackingUpdate[], needRefetch = true) => {
    if (Array.isArray(formData)) return updateMany(formData, needRefetch);
    else return service.update(formData.id, formData).then(res => {
      if (needRefetch) fetchList()
      return res;
    });
  }

  const updateMany = (items: TrackingUpdate[], needRefetch = true) => {
    const reqs = items.map((item => service.update(item.id, item)));
    return Promise.all(reqs).then(res => {
      if (needRefetch) fetchList();
      return res;
    })
  }

  return { list, isLoading, calendar, filter, setFilter, fetchList, fetchDetail, create, update };
});