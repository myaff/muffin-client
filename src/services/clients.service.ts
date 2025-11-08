import { Client, ClientCreate, ClientUpdate } from "@/models/clients.model";
import { ApiService } from "./api.service";
import { AxiosError } from "axios";
import { EntityService, ListService } from "@/models/service.model";

export class ClientsService extends ApiService implements ListService<Client>, EntityService<Client, ClientCreate, ClientUpdate> {
  resource = '/client';
  create(formData: ClientCreate) {
    return ClientsService.api.post<Client>(this.resource, formData)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  update(id: string | number, formData: ClientUpdate) {
    return ClientsService.api
      .patch(`${this.resource}/${id}`, formData);
  }

  delete(id: string | number) {
    return ClientsService.api.delete(`${this.resource}/${id}`)
  }

  findOne(id: string | number) {
    return ClientsService.api
      .get<Client>(`${this.resource}/${id}`)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  findAll() {
    return ClientsService.api
      .get<Client[]>(this.resource)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }
}