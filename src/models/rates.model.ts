import { Currency } from "./currency.model";
import { Project } from "./projects.model";

export enum RateType {
  HOURLY = 'hourly',
  MONTHLY = 'monthly',
  FIXED = 'fixed',
}

export interface Rate {
  currency: Pick<Currency, 'id'>;
  value: number;
  type: RateType;
}

export interface RateDetail extends Rate {
  id: number;
  dateFrom: string;
  dateTo: string | null;
  projects?: Project[];
}

export type RateCreate = Omit<RateDetail, 'id' | 'projects'> & { projects: Pick<Project, 'id'>[] }
export type RateUpdate = Partial<RateDetail>;

export function isRate(data: unknown): data is RateDetail {
  return data !== null
    && typeof data === 'object'
    && 'id' in data
    && 'currency' in data
    && 'value' in data
    && 'type' in data;
}