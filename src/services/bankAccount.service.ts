import { EntityService, ListService } from "@/models/service.model";
import { ApiService } from "./api.service";
import { BankAccount, BankAccountCreate, BankAccountUpdate } from "@/models/bankAccount.model";
import { AxiosError } from "axios";

export class BankAccountService
  extends ApiService
  implements ListService<BankAccount>, EntityService<BankAccount, BankAccountCreate, BankAccountUpdate> {
  resource = '/bank-account';

  create(formData: BankAccountCreate) {
    return BankAccountService.api.post<BankAccount>(this.resource, formData)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  update(id: string | number, formData: BankAccountUpdate) {
    return BankAccountService.api
      .patch<BankAccount>(`${this.resource}/${id}`, formData)
      .then(res => res.data);
  }

  delete(id: string | number) {
    return BankAccountService.api.delete(`${this.resource}/${id}`)
  }

  findOne(id: string | number) {
    return BankAccountService.api
      .get<BankAccount>(`${this.resource}/${id}`)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  findAll() {
    return BankAccountService.api
      .get<BankAccount[]>(this.resource)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }
}