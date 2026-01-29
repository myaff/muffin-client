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

  const create = (formData: TrackingCreate | TrackingCreate[]) => {
    return service.create(formData);
  }

  const update = (formData: TrackingUpdate | TrackingUpdate[]) => {
    if (Array.isArray(formData)) return updateMany(formData);
    else return service.update(formData.id, formData);
  }

  const updateMany = (items: TrackingUpdate[]) => {
    const reqs = items.map((item => service.update(item.id, item)));
    return Promise.all(reqs);
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