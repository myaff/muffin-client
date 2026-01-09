import { ApiService } from "./api.service";
import { AxiosError } from "axios";
import { EntityService, ListService } from "@/models/service.model";
import { Tracking, TrackingCreate, TrackingUpdate } from "@/models/tracking.model";
import { FetchListParams, PaginatableList } from "@/models/common.model";
import qs from 'qs';
import { isArray } from "lodash-es";

export class TrackingService extends ApiService implements ListService<Tracking>, EntityService<Tracking, TrackingCreate, TrackingUpdate> {
  resource = '/tracking';
  create(formData: TrackingCreate | TrackingCreate[]) {
    const fromDataArr = isArray(formData) ? formData : [formData];
    const prepared = fromDataArr.map(item => ({ ...item, date: this.formatDate(item.date) }));
    return TrackingService.api.post<Tracking>(this.resource, prepared)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  update(id: string | number, formData: TrackingUpdate) {
    return TrackingService.api
      .patch<Tracking>(`${this.resource}/${id}`, formData);
  }

  delete(id: string | number) {
    return TrackingService.api.delete(`${this.resource}/${id}`)
  }

  findOne(id: string | number) {
    return TrackingService.api
      .get<Tracking>(`${this.resource}/${id}`)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  findAll(params?: FetchListParams) {
    const q = params
      ? qs.stringify(params, {
        addQueryPrefix: true,
        arrayFormat: 'repeat',
      })
      : '';
    return TrackingService.api
      .get<PaginatableList<Tracking>>(this.resource+q)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }
}