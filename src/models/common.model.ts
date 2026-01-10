export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export type FilterParamValue = string | number | boolean;
export interface FilterParams {
  [key: string]: FilterParamValue | FilterParamValue[];
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}
export interface SortParams {
  sortBy: string;
  order: SortOrder;
}

export interface Paginatable {
  page: number;
  pageSize: number;
  pagesCount: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type FetchListParams = Partial<PaginationParams & FilterParams & SortParams>;

export interface PaginatableList<T extends BaseContentEntity> extends Paginatable {
  list: T[];
}

export interface ValidationError {
  property: string;
  error: { [key: string]: string };
}

export interface ResponseError {
  statusCode: number;
  message: string;
  errors?: ValidationError[];
}

export interface BaseContentEntity {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface Deliverable {
  startDate: string | null;
  endDate: string | null;
}

export interface Estimate {
  min: number | null;
  max: number | null;
}

export interface Estimatable {
  estimate: Estimate | null;
}

export interface Mood {
  valence: number | null;
  arousal: number | null;
}

export interface Moodable {
  mood: Mood | null;
}