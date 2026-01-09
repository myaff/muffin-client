import { ApiService } from "./api.service";
import { AxiosError } from "axios";
import { EntityService, ListService } from "@/models/service.model";
import { RateDetail, RateCreate, RateUpdate, Rate } from "@/models/rates.model";
import { PaginatableList } from "@/models/common.model";

export class RatesService extends ApiService implements ListService<RateDetail>, EntityService<RateDetail, RateCreate, RateUpdate> {
  resource = '/rate';
  create(formData: RateCreate) {
    const prepared = {
      ...formData,
      dateFrom: this.formatDate(formData.dateFrom),
      dateTo: formData.dateTo ? this.formatDate(formData.dateTo) : null,
    };
    return RatesService.api.post<RateDetail>(this.resource, prepared)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  update(id: string | number, formData: RateUpdate) {
    return RatesService.api
      .patch<RateDetail>(`${this.resource}/${id}`, formData);
  }

  delete(id: string | number) {
    return RatesService.api.delete(`${this.resource}/${id}`)
  }

  findOne(id: string | number) {
    return RatesService.api
      .get<RateDetail>(`${this.resource}/${id}`)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  findAll() {
    return RatesService.api
      .get<PaginatableList<RateDetail>>(this.resource)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }
}