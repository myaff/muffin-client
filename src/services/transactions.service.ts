import { EntityService, ListService } from "@/models/service.model";
import { ApiService } from "./api.service";
import { Transaction, TransactionCreate, TransactionUpdate } from "@/models/transaction.model";
import { AxiosError } from "axios";
import { FetchListParams, PaginatableList } from "@/models/common.model";
import qs from "qs";

export class TransactionService
  extends ApiService
  implements ListService<Transaction>, EntityService<Transaction, TransactionCreate, TransactionUpdate> {
    resource = '/transaction';

  create(formData: TransactionCreate) {
    return TransactionService.api.post<Transaction>(this.resource, formData)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  update(id: string | number, formData: TransactionUpdate) {
    return TransactionService.api
      .patch<Transaction>(`${this.resource}/${id}`, formData)
      .then((res) => res.data);
  }

  delete(id: string | number) {
    return TransactionService.api.delete(`${this.resource}/${id}`)
  }

  findOne(id: string | number) {
    return TransactionService.api
      .get<Transaction>(`${this.resource}/${id}`)
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
    return TransactionService.api
      .get<PaginatableList<Transaction>>(this.resource + q)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }
}