import { EntityService, ListService } from "@/models/service.model";
import { ApiService } from "./api.service";
import { Orgform, OrgformCreate, OrgformUpdate } from "@/models/orgform.model";
import { AxiosError } from "axios";

export class OrgformService extends ApiService implements ListService<Orgform>, EntityService<Orgform, OrgformCreate, OrgformUpdate> {
  resource = '/orgform';
  create(formData: OrgformCreate) {
    return OrgformService.api.post<Orgform>(this.resource, formData)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  update(id: string | number, formData: OrgformUpdate) {
    return OrgformService.api
      .patch(`${this.resource}/${id}`, formData);
  }

  delete(id: string | number) {
    return OrgformService.api.delete(`${this.resource}/${id}`)
  }

  findOne(id: string | number) {
    return OrgformService.api
      .get<Orgform>(`${this.resource}/${id}`)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  findAll() {
    return OrgformService.api
      .get<Orgform[]>(this.resource)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }
}