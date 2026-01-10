import { BaseContentEntity, FetchListParams, PaginatableList } from "./common.model";

export interface ListService<T extends BaseContentEntity, P extends FetchListParams = FetchListParams> {
  findAll: (params?: P) => Promise<PaginatableList<T>>
}

export interface EntityService<T, C = T, U = C, D = T> {
  findOne: (id: number | string) => Promise<D>;
  create: (formData: C) => Promise<D>;
  update: (id: string | number, formData: U) => Promise<D>;
  delete: (id: string | number) => Promise<unknown>;
}