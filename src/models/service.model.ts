import { FetchListParams } from "./common.model";

export interface ListService<T> {
  findAll: (params?: FetchListParams) => Promise<T[]>
}

export interface EntityService<T, C = T, U = C, D = T> {
  findOne: (id: number | string) => Promise<D>;
  create: (formData: C) => Promise<T>;
  update: (id: string | number, formData: U) => Promise<unknown>;
  delete: (id: string | number) => Promise<unknown>;
}