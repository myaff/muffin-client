import { EntityService, ListService } from "@/models/service.model";
import { ApiService } from "./api.service";
import { Invoice, InvoiceCreate, InvoicePreview, InvoicePreviewParams, InvoiceUpdate } from "@/models/invoice.model";
import { FetchListParams, PaginatableList } from "@/models/common.model";
import { AxiosError } from "axios";

export class InvoiceService
  extends ApiService
  implements ListService<Invoice>, EntityService<Invoice, InvoiceCreate, InvoiceUpdate> {
  resource = '/invoice';

  create(formData: InvoiceCreate) {
    return InvoiceService.api.post<Invoice>(this.resource, formData)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  update(id: string | number, formData: InvoiceUpdate) {
    return InvoiceService.api
      .patch<Invoice>(`${this.resource}/${id}`, formData)
      .then((res) => res.data);
  }

  delete(id: string | number) {
    return InvoiceService.api.delete(`${this.resource}/${id}`)
  }

  findOne(id: string | number) {
    return InvoiceService.api
      .get<Invoice>(`${this.resource}/${id}`)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  findAll(params?: FetchListParams) {
    const q = this.stringifyParams(params);
    return InvoiceService.api
      .get<PaginatableList<Invoice>>(this.resource+q)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }

  findPreview(params: InvoicePreviewParams) {
    const q = this.stringifyParams(params);
    return InvoiceService.api
      .get<InvoicePreview>(`${this.resource}/preview${q}`)
      .then(res => res.data)
      .catch((error: AxiosError) => {
        throw { title: error.code, message: error.message };
      });
  }
}