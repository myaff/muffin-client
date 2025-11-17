export interface PaginationParams {
  skip: number;
  take: number;
}

export interface FilterParams {
  query: string;
  [key: string]: string | number | (string | number)[];
}

export interface SortParams {
  sortBy: string;
  order: 'asc' | 'desc';
}

export type FetchListParams = Partial<PaginationParams & FilterParams & SortParams>;

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