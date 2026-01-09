import { EntityService, ListService } from "@/models/service.model";
import { ApiService } from "./api.service";
import { AxiosError } from "axios";
import { Status, StatusCreate, StatusUpdate } from "@/models/status.model";

export class StatusService extends ApiService implements EntityService<Status, StatusCreate, StatusUpdate> {
  resource = '/status';
  create(formData: StatusCreate) {
    return StatusService.api.post<Status>(this.resource, formData)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  update(id: string | number, formData: StatusUpdate) {
    return StatusService.api
      .patch(`${this.resource}/${id}`, formData);
  }

  delete(id: string | number) {
    return StatusService.api.delete(`${this.resource}/${id}`)
  }

  findOne(id: string | number) {
    return StatusService.api
      .get<Status>(`${this.resource}/${id}`)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  findAll() {
    return StatusService.api
      .get<Status[]>(this.resource)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }
}