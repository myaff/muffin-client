import { EntityService, ListService } from "@/models/service.model";
import { ApiService } from "./api.service";
import { TransactionCategory, TransactionCategoryCreate, TransactionCategoryUpdate } from "@/models/transaction.model";
import { AxiosError } from "axios";
import { PaginatableList } from "@/models/common.model";

export class TransactionCategoryService
  extends ApiService
  implements ListService<TransactionCategory>, EntityService<TransactionCategory, TransactionCategoryCreate, TransactionCategoryUpdate> {
  resource = '/transaction-category';

  create(formData: TransactionCategoryCreate) {
    return TransactionCategoryService.api.post<TransactionCategory>(this.resource, formData)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  update(id: string | number, formData: TransactionCategoryUpdate) {
    return TransactionCategoryService.api
      .patch<TransactionCategory>(`${this.resource}/${id}`, formData)
      .then((res) => res.data);
  }

  delete(id: string | number) {
    return TransactionCategoryService.api.delete(`${this.resource}/${id}`)
  }

  findOne(id: string | number) {
    return TransactionCategoryService.api
      .get<TransactionCategory>(`${this.resource}/${id}`)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  findAll() {
    return TransactionCategoryService.api
      .get<PaginatableList<TransactionCategory>>(this.resource)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }
}