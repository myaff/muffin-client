import { ApiService } from "./api.service";
import { AxiosError } from "axios";
import { EntityService, ListService } from "@/models/service.model";
import { RatePlanFull, RatePlanCreate, RatePlanUpdate, RatePlan, RateVersionCreate, RateVersion, RateVersionUpdate } from "@/models/rates.model";
import { PaginatableList } from "@/models/common.model";

export class RatesService extends ApiService implements ListService<RatePlanFull>, EntityService<RatePlanFull, RatePlanCreate, RatePlanUpdate> {
  resource = '/rate';
  create(formData: RatePlanCreate) {
    return RatesService.api
      .post<RatePlanFull>(this.resource, formData)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  update(id: string | number, formData: RatePlanUpdate) {
    return RatesService.api
      .patch<RatePlanFull>(`${this.resource}/${id}`, formData)
      .then(res => res.data);
  }

  delete(id: string | number) {
    return RatesService.api.delete(`${this.resource}/${id}`)
  }

  findOne(id: string | number) {
    return RatesService.api
      .get<RatePlanFull>(`${this.resource}/${id}`)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  findAll() {
    return RatesService.api
      .get<PaginatableList<RatePlanFull>>(this.resource)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  createVersion(ratePlanId: RatePlan['id'], formData: RateVersionCreate) {
    return RatesService.api
      .post<RateVersion>(`${this.resource}/${ratePlanId}/version`, formData)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }
  updateVersion(ratePlanId: RatePlan['id'], versionId: RateVersion['id'], formData: RateVersionUpdate) {
    return RatesService.api
      .patch<RateVersion>(`${this.resource}/${ratePlanId}/version/${versionId}`, formData)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }
  deleteVersion(ratePlanId: RatePlan['id'], versionId: RateVersion['id']) {
    return RatesService.api
      .delete(`${this.resource}/${ratePlanId}/version/${versionId}`)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }
}