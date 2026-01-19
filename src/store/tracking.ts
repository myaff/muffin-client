import { FetchListParams } from "@/models/common.model";
import { TrackingCreate, TrackingUpdate } from "@/models/tracking.model";
import { TrackingService } from "@/services/tracking.service";
import { defineStore } from "pinia";

export const useTrackingStore = defineStore('tracking', () => {
  const service = new TrackingService();

  const fetchList = (filterData?: FetchListParams) => {
    return service.findAll(filterData);
  }

  const fetchCalendar = (filterData: FetchListParams) => {
    return service.findCalendar(filterData);
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

  return {
    service,
    fetchList,
    fetchCalendar,
    fetchDetail,
    create,
    update,
  };
});