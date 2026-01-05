import { FetchListParams } from "./common.model";

export interface ListService<T, P extends FetchListParams = FetchListParams> {
  findAll: (params?: P) => Promise<T[]>
}

export interface EntityService<T, C = T, U = C, D = T> {
  findOne: (id: number | string) => Promise<D>;
  create: (formData: C) => Promise<T>;
  update: (id: string | number, formData: U) => Promise<D>;
  delete: (id: string | number) => Promise<unknown>;
}